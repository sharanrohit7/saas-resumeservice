import { Request, Response } from 'express';
import { upsertUser } from '../services/userservice';

export async function upsertUserController(req: Request, res: Response) {
    try {
      const authToken = req.headers.authorization?.replace('Bearer ', '');
  
      if (!authToken) {
        return res.status(401).json({ error: 'Missing auth token in headers' });
      }
  
      const {
        email,
        refreshToken,
        firebaseUID,
        photoURL,
        authProvider,
        country,
      } = req.body;
  
      if (!email) {
        return res.status(400).json({ error: 'Email is required in request body' });
      }
  
      // You could verify the token here with Google or Firebase if needed
      // const decoded = await verifyGoogleToken(authToken); // Optional step
  
      const user = await upsertUser({
        email,
        refreshToken,
        firebaseUID,
        photoURL,
        authProvider,
        country,
      });
     console.log("sigin");
     
      return res.status(200).json({ success: true, user });
    } catch (error: any) {
      console.error('upsertUserController error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
  }