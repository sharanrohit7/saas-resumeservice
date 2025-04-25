import { Messages } from "../../Interface/llm";
import {BaseAnalysis, DeepAnalysis}from "../../Interface/analysis"
import { generateATSAnalysisPrompt, generateDeepResumeAnalysisPrompt } from "../prompts/prompt_v1";
import { callGPTLLM } from "../LLMs/gpt.llm";
export type QueryType = "BASIC" | "PRO";

export interface ResumeAnalysisQuery {
  model: string;
  queryType: QueryType;
}
export const analyzeResume = async (
    query: ResumeAnalysisQuery,
    data: Messages
  ): Promise<BaseAnalysis | DeepAnalysis | {}> => {
    let prompt = "";
  
    if (query.queryType === "PRO") {
      prompt = generateDeepResumeAnalysisPrompt(data);
    } else if (query.queryType === "BASIC") {
      prompt = generateATSAnalysisPrompt(data);
    } else {
      return {};
    }
  
    
  
    try {
        // Send to LLM (Example placeholder)
        // console.log("Calling LLM");
        
    const llmResponse = await callLLM(query.model,prompt );
    // console.log("LLM RESPONSE ...................................................");
    // console.log(llmResponse);
    
    const cleanedContent = llmResponse.content.replace(/```json\s*([\s\S]*?)```/, '$1').trim();
    const parsed = JSON.parse(cleanedContent);
    
      return parsed;
    } catch (error) {
      console.error("Failed to parse LLM response:", error);
      return {};
    }
  };


  const callLLM = async (model: string, prompt: string): Promise<any> => {
    switch (model) {
      case "o4-mini-2025-04-16":
      case "gpt-3.5-turbo":
        return await callGPTLLM(prompt, model);
  
    //   case "claude-3-opus-20240229":
    //     return await callAnthropic(prompt, model);
  
    //   case "custom-model":
    //     return await callCustomModel(prompt);
  
      default:
        console.warn(`Model "${model}" is not supported.`);
        return "{}";
    }
  };
  

