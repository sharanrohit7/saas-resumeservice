import { Request, Response } from "express";
import { analyzeResume } from "../utils/analyzeResume";
import { Messages } from "../../Interface/llm";
import { fetchAndExtractPdfText } from "../utils/fileReader";
import { AnalysisReferenceData } from "../../Interface/dbServiceInterface";
import { SaveAnalysisData } from "../services/subscriptionService";
import { BaseAnalysis, DeepAnalysis } from "../../Interface/analysis";
import { CreditService } from "../utils/creditManager";
import { getResumeContentById } from "../services/resumeService";

export const analyzeResumeController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { resume_id, job_desc, company_name, job_title, model, queryType } = req.body;

    // Validate required fields
    if (!resume_id || !job_desc || !company_name || !job_title || !model || !queryType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // const resumeInfo = await fetchAndExtractPdfText(resume_id);
   const resumeInfo = await getResumeContentById(resume_id);
    if (!resumeInfo) {
      return res.status(400).json({ error: "Failed to extract text from the resume" });
    }
    if (!resumeInfo.success) {
      return res.status(400).json({ error: resumeInfo.message });
    }
    if (!resumeInfo.content) {
      return res.status(400).json({ error: "No content found in the resume" });
    }
    
    let resdata = (resumeInfo.content as { text: string }).text.toString();
    
    const input: Messages = { 
      resumeInfo:resdata,   
      job_desc, 
      company_name, 
      job_title 
    };

    const data: AnalysisReferenceData = {
      userId,
      resumeId: resume_id,
      queryType,
      job_desc,
      job_title,
      company_name
    };

    const result = await analyzeResume({ model, queryType }, input, userId);

    // Handle errors from analysis
    if (result.error) {
      const statusCode = result.details ? 400 : 422;
      return res.status(statusCode).json({
        success: false,
        message: result.error,
        details: result.details || undefined
      });
    }

    const analysisData = await SaveAnalysisData(
      result.data as BaseAnalysis | DeepAnalysis,
      data
    );

    await CreditService.deductCredits(
      userId,
      queryType,
      analysisData.id,
      result.requiredTokens ?? 0
    );

    return res.status(200).json({
      success: true,
      plan: queryType,
      data: result.data
    });

  } catch (error: any) {
    console.error("Error analyzing resume:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message
    });
  }
};
