import { Request,Response, Router } from "express";
import { getAllPlansHandler, getUserCreditsBalance } from "../controller/plans.controller";

const router = Router()


router.get("/user",getUserCreditsBalance)
router.get("/plans",getAllPlansHandler)
export default router