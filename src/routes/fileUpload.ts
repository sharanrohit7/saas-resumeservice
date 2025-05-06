import { Request,Response, Router } from "express";
import { uploadResumesController } from "../controller/uploader";
import { firebaseAuth } from "../middlwares/auth.middleware";


const router = Router()


router.post("/upload", firebaseAuth,uploadResumesController)
export default router