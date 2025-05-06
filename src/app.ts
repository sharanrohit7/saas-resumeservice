import express, { Request, Response } from "express";
import resumeRouter from "./routes/analyzeresume"
import uploadRouter from "./routes/fileUpload"
import authRouter from "./routes/auth.route"
import statRouter from "./routes/userStatsRoute"

import helmet from "helmet";
import cors from 'cors'
import { firebaseAuth } from "./middlwares/auth.middleware";
const app = express();
app.use(express.json());
app.use(helmet())
app.use(cors())

app.use("/resume",resumeRouter)
app.use("/file",uploadRouter)
app.use("/auth",authRouter)
app.use("/user",firebaseAuth,statRouter)
export default app;