
import { Request,Response, Router } from "express";
import { getAnalysisByIdController, userStatsController } from "../controller/userStatsController";



const router = Router()


router.get("/getResumeStat",userStatsController)
router.get("/detailedAnalysis/:id", getAnalysisByIdController);


export default router