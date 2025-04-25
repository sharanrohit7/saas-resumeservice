import express from 'express';
import { upsertUserController } from '../controller/auth.controller';
const router = express.Router();

router.post('/signin', upsertUserController);

export default router;
