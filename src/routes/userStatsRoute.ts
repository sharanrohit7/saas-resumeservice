
import { Request,Response, Router } from "express";
import { firebaseAuth } from "../middlwares/auth.middleware";
import { userStatsController } from "../controller/userStatsController";



const router = Router()


router.get("/getResumeStat",userStatsController)
export default router