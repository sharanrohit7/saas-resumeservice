import { Request, Response } from "express";
import { getDetailedAnalysisService, getRecentTop5Scores } from "../services/userstatsService";
import { UUID } from "crypto";

export const userStatsController = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Fetch user statistics from the database or any other source
    const userStats = await getRecentTop5Scores(userId);

    if (!userStats) {
      return res.status(404).json({ error: "User statistics not found" });
    }

    return res.status(200).json(userStats);
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const getAnalysisByIdController = async (req: Request, res: Response) => {
  // const userId = req.user?.id;
  // if (!userId) {
  //   return res.status(401).json({ error: "Unauthorized" });
  // }
const userId = req.body.userId
  const analysisId = req.params.id;
  if (!analysisId) {
    return res.status(400).json({ error: "Analysis ID is required in URL" });
  }

  try {
    const analysis = await getDetailedAnalysisService(analysisId, userId);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    return res.status(200).json(analysis);
  } catch (error) {
    console.error("Error fetching user analysis:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
