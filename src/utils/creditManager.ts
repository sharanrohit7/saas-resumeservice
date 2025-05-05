// src/services/credit.service.ts
import { Prisma } from '@prisma/client';
import { AnalysisType, PrismaClient } from '../../generated/prisma';


const prisma = new PrismaClient();

// Define credit costs (can be moved to config)
const CREDIT_COSTS: Record<AnalysisType, number> = {
  BASIC: 1,
  PRO: 3,

};

export class CreditService {
  // Get real-time balance with cache support
  static async getBalance(userId: string): Promise<number> {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.users.findUnique({
        where: { id: userId },
        select: { creditsBalance: true }
      });
      return user?.creditsBalance ?? 0;
    });
  }

  // Full credit validation with Prisma
  static async validateCredits(
    userId: string,
    analysisType: AnalysisType,
    contentLength: number
  ): Promise<{
    canProceed: boolean;
    required: number;
    available: number;
    message: string;
  }> {
    const [available, required] = await Promise.all([
      this.getBalance(userId),
      this.estimateCost(analysisType,contentLength)
    ]);

    const delta = required - available;
    return {
      canProceed: available >= required,
      required,
      available,
      message: available >= required
        ? `This ${analysisType.toLowerCase()} analysis will deduct ${required} credits`
        : `Insufficient credits. Need ${delta} more for ${analysisType} analysis`
    };
  }

  // Dynamic cost estimation
  static estimateCost(
    analysisType: AnalysisType,
    contentLength?: number
  ): number {
    const baseCost = CREDIT_COSTS[analysisType] || CREDIT_COSTS.BASIC;
    
    // Optional content-based scaling
    if (contentLength) {
      return baseCost * Math.max(1, Math.ceil(contentLength / 2000)); // 1 credit per 2KB
    }
    return baseCost;
  }

  // Atomic credit deduction
  static async deductCredits(
    userId: string,
    analysisType: AnalysisType,
    referenceId: string
  ): Promise<void> {
    const cost = this.estimateCost(analysisType);
    
    await prisma.$transaction([
      // Deduct from balance
      prisma.users.update({
        where: { id: userId },
        data: { 
          creditsBalance: { decrement: cost },
          lastCreditActivity: new Date() 
        }
      }),
      // Record transaction
      prisma.credit_transactions.create({
        data: {
          transaction_id: crypto.randomUUID(), // Generate a unique transaction ID
          amount: -cost,
          user_id: userId,
          description: `${analysisType} analysis`,
          reference_id: referenceId,
          txn_type: 'analysis'
        }
      })
    ]);
  }
}