import { Request, Response } from 'express';
import { getResumeById } from '../services/resumeService';

export const getUserResumesController = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const resumes = await getResumeById(userId);

    // if (!Array.isArray(resumes) || resumes.length === 0) {
    //   return res.status(404).json({ success: false, message: "No resumes found for this user" });
    // }
console.log("My resume hit");

    return res.send(resumes)
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve resumes"
    });
  }
};
