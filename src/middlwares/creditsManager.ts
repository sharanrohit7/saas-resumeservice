import { Request, Response, NextFunction } from 'express';

import { CreditService } from '../utils/creditManager';
import { AnalysisType } from '../../prisma/generated/prisma';
export class CreditEstimation {
  static async estimate(
    userId: string,
    analysisType: AnalysisType,
    contentLength?: number
  ) {
    const required = CreditService.estimateCost(analysisType, contentLength);
    const available = await CreditService.getBalance(userId);
    console.log(`User ${userId} has ${available} credits, requires ${required} for ${analysisType} analysis`);
    
    return {
      canProceed: available >= required,
      required,
      available,
      delta: Math.max(0, required - available),
      message: available >= required
        ? `Estimated cost: ${required} credits`
        : `Need ${required - available} more credits`
    };
  }
}