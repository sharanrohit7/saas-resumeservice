import { Request,Response, Router } from "express";
import { getUserCreditsBalance } from "../controller/plans.controller";

const router = Router()


router.get("/user",getUserCreditsBalance)
export default router