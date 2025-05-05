import { Messages } from "../../Interface/llm";
import { BaseAnalysis, DeepAnalysis } from "../../Interface/analysis"
import { generateATSAnalysisPrompt, generateDeepResumeAnalysisPrompt } from "../prompts/prompt_v1";
import { callGPTLLM } from "../LLMs/gpt.llm";
import { CreditEstimation } from "../middlwares/creditsManager";
import { CreditService } from "./creditManager";

export type QueryType = "BASIC" | "PRO";

export interface ResumeAnalysisQuery {
  model: string;
  queryType: QueryType;
}

export const analyzeResume = async (
  query: ResumeAnalysisQuery,
  data: Messages,
  userId: string,
): Promise<BaseAnalysis | DeepAnalysis | {}> => {
  if (!query.queryType || !query.model) {
    console.error("Invalid query parameters");
    return { error: "Invalid query parameters" };
  }

  let prompt = "";
  try {
    prompt = query.queryType === "PRO" 
      ? generateDeepResumeAnalysisPrompt(data) 
      : generateATSAnalysisPrompt(data);
  } catch (error) {
    console.error("Failed to generate prompt:", error);
    return { error: "Prompt generation failed" };
  }
 const promptLength = prompt.length;
  if (promptLength > 4000) {
    console.error("Prompt length exceeds limit:", promptLength);
    return { error: "Prompt length exceeds limit" };
  }
  console.log("Prompt length:", promptLength);
  const estimation = await CreditEstimation.estimate(
    userId,
    query.queryType,
    promptLength
  );

  if (!estimation.canProceed) {
    throw new Error(estimation.message);
  }
  try {
    const llmResponse = await callLLM(query.model, prompt);
    
    if (!llmResponse?.content) {
      console.error("Empty LLM response received");
      return { error: "Empty response from LLM" };
    }

    // console.log("Raw LLM response:", llmResponse.content); // Debug logging

    const parsedResponse = safelyParseLLMResponse(llmResponse.content);
    if (!parsedResponse) {
      return { error: "Could not parse valid JSON from LLM response" };
    }

    const validated = validateAnalysisStructure(parsedResponse, query.queryType);
    

    return validated || { error: "Response validation failed" };
   
  } catch (error: any) {
    console.error("Analysis failed:", error);
    return { error: "Analysis process failed", details: error.message };
  }
};

// Enhanced response parsing with multiple fallback strategies
const safelyParseLLMResponse = (content: string): any | null => {
  // Strategy 1: Try direct JSON parse
  try {
    return JSON.parse(content);
  } catch (e) {
    console.log("Direct parse failed, trying extraction");
  }

  // Strategy 2: Extract JSON from markdown or text
  const jsonCandidates = [
    // Try extracting from markdown code blocks
    content.match(/```json\n([\s\S]*?)\n```/)?.[1],
    content.match(/```([\s\S]*?)\n```/)?.[1],
    
    // Try extracting JSON object/array
    content.match(/(\{[\s\S]*\})/)?.[0],
    content.match(/(\[[\s\S]*\])/)?.[0],
    
    // Try last resort extraction
    content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1)
  ];

  // Try all possible candidates
  for (const candidate of jsonCandidates) {
    if (!candidate) continue;
    
    try {
      // Clean common issues before parsing
      const cleaned = candidate
        .replace(/^[^{[]+/, '') // Remove non-JSON prefix
        .replace(/[^}\]]+$/, '') // Remove non-JSON suffix
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // Fix unquoted keys
        .replace(/:\s*(['"])(.*?)\1/g, ': "$2"') // Fix string values
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

      const parsed = JSON.parse(cleaned);
      console.log("Successfully parsed JSON from candidate");
      return parsed;
    } catch (e) {
      continue;
    }
  }

  console.error("All JSON parsing strategies failed");
  return null;
};

// Enhanced validation with better error reporting
const validateAnalysisStructure = (data: any, queryType: QueryType): any => {
  if (!data || typeof data !== 'object') {
    console.error("Invalid data type received");
    return null;
  }

  const requiredStructures = {
    BASIC: ['metadata', 'score_breakdown', 'gap_analysis'],
    PRO: ['metadata', 'deep_analysis', 'readability_analysis']
  };

  const missingSections = requiredStructures[queryType].filter(
    section => !data[section]
  );

  if (missingSections.length > 0) {
    console.error(`Missing required sections: ${missingSections.join(', ')}`);
    return null;
  }

  return data;
};

// Improved LLM call with better error handling
const callLLM = async (model: string, prompt: string): Promise<any> => {
  try {
    const response = await callGPTLLM(prompt, model);
    
    if (!response) {
      throw new Error("Empty response from LLM API");
    }
    
    return response;
  } catch (error) {
    console.error(`LLM call failed for model ${model}:`, error);
    throw error;
  }
};