import { Request,Response, Router } from "express";
import { uploadResumesController } from "../controller/uploader";


const router = Router()


router.post("/upload", uploadResumesController)
export default router