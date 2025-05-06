import { Request,Response, Router } from "express";
import { analyzeResumeController } from "../controller/analyze";
import { firebaseAuth } from "../middlwares/auth.middleware";
import { getUserResumesController } from "../controller/resumeController";


const router = Router()


router.post("/analyze",firebaseAuth,analyzeResumeController)
router.get("/getResumes",firebaseAuth,getUserResumesController)
export default router