import { Request,Response, Router } from "express";
import { analyzeResumeController } from "../controller/analyze";

const router = Router()


router.post("/analyze", analyzeResumeController)
export default router