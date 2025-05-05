import { Request,Response, Router } from "express";
import { analyzeResumeController } from "../controller/analyze";
import { firebaseAuth } from "../middlwares/auth.middleware";


const router = Router()


router.post("/analyze", firebaseAuth,analyzeResumeController)
export default router