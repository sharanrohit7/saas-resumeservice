import { Request, Response } from 'express';
import { getAllPlans, getUserCredits } from '../services/plans.service';
import { log } from 'node:console';


export const getUserCreditsBalance = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log("Get balance hit");
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await getUserCredits(userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json({ success: true, balance: result.data });
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getAllPlansHandler = async (req: Request, res: Response) => {
  try {
    const result = await getAllPlans();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || "Failed to fetch plans",
        error: result.error,
      });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Unexpected error in getAllPlansHandler:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};