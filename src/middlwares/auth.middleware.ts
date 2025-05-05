// src/middlewares/firebaseAuth.ts
import { Request, Response, NextFunction } from 'express';
import {  FirebaseError } from 'firebase-admin';

import { PrismaClient } from '../../generated/prisma';
import { auth } from '../config/firebase';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        firebaseUID: string;
      };
    }
  }
}
const prisma = new PrismaClient();
export const firebaseAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const firebaseUID = decodedToken.uid;
    console.log("Decoded Token:", decodedToken);
    
    // Get your internal user ID from Firebase UID
    const user = await prisma.users.findUnique({
      where: { firebaseUID },
      select: { id: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      firebaseUID
    };

    next();
  } catch (error) {
    const firebaseError = error as FirebaseError;
    
    switch (firebaseError.code) {
      case 'auth/id-token-expired':
        return res.status(401).json({ error: 'Token expired' });
      case 'auth/argument-error':
        return res.status(400).json({ error: 'Invalid token' });
      default:
        return res.status(401).json({ error: 'Unauthorized' });
    }
  }
};