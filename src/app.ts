import express from "express";
import resumeRouter from "./routes/analyzeresume"
import uploadRouter from "./routes/fileUpload"
import authRouter from "./routes/auth.route"
import statRouter from "./routes/userStatsRoute"
import credits from "./routes/plans.route"
import helmet from "helmet";
import cors from 'cors'
import { firebaseAuth } from "./middlwares/auth.middleware";
const app = express();
app.use(express.json());
app.use(helmet())
const allowedOrigins = [
  "http://localhost:3000",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // for cookies or sessions
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
app.use("/resume",resumeRouter)
app.use("/file",uploadRouter)
app.use("/auth",authRouter)
app.use("/user", firebaseAuth,statRouter)
app.use("/credits", firebaseAuth,credits)
export default app;