import { Request, Response } from "express";
import { analyzeResume } from "../utils/analyzeResume";
import { Messages } from "../../Interface/llm";
import { fetchAndExtractPdfText } from "../utils/fileReader";

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
  
      const result = await analyzeResume({ model, queryType }, input);
  
      return res.status(200).json({ success: true, plan : queryType,data: result });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };