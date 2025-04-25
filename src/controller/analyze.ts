import { Request, Response } from "express";
import { analyzeResume } from "../utils/analyzeResume";
import { Messages } from "../../Interface/llm";
import { fetchAndExtractPdfText } from "../utils/fileReader";
import { AnalysisReferenceData } from "../../Interface/dbServiceInterface";
import { SaveAnalysisData } from "../services/subscriptionService";
import { BaseAnalysis, DeepAnalysis } from "../../Interface/analysis";

export const analyzeResumeController = async (req: Request, res: Response) => {
    try {
      const {resume_url, job_desc, company_name, job_title, model, queryType } = req.body;
  
      // Validate required fields
      if (!resume_url || !job_desc || !company_name || !job_title || !model || !queryType) {
        return res.status(400).json({ error: "Missing required fields" });
      }
     const resumeInfo = await fetchAndExtractPdfText(resume_url);
      if (!resumeInfo) {
        return res.status(400).json({ error: "Failed to extract text from the resume" });
      }
      const input: Messages = {
        resumeInfo,
        job_desc,
        company_name,
        job_title
      };
     
      const data: AnalysisReferenceData={
        userId: "be5a9c3e-1685-4cbd-a816-43e1d470c9ee",
        resumeId: "be5a9c3e-1685-4cbd-a816-43e1d470c9ee",
        queryType: queryType,
        job_desc: job_desc,
        job_title: job_title,
        company_name: company_name
      }
     
      const result = await analyzeResume({ model, queryType }, input);

      
     
      await SaveAnalysisData(result as unknown as BaseAnalysis | DeepAnalysis, data);
      return res.status(200).json({ success: true, plan : queryType,data: result });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };