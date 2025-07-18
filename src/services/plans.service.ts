import { UUID } from "crypto";
import { PrismaClient } from "../../prisma/generated/prisma";

const prisma = new PrismaClient();
export const getAllPlans = async () => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        features: true,
        amount: true,
        currency: true,
        offer_price: true,
      },
    });

    return {
      success: true,
      data: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        features: plan.features,
        price: {
          original: plan.amount,
          offer: plan.offer_price ?? plan.amount, // fallback to amount if offer_price is null
          currency: plan.currency,
        },
      })),
    };
  } catch (error: any) {
    console.error("❌ Failed to fetch plans:", error);
    return {
      success: false,
      message: "Failed to fetch plans",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
};

export const getUserCredits = async(userId: string)=>{
 try {
      const balance = await prisma.users.findUnique({
        where: { id: userId },
        select: {creditsBalance: true}
      });
  
      if (!balance) {
        return {
          success: false,
          message: 'No Balance found'
        };
      }
  
      return {
        success: true,
        data: balance
      };
    } catch (error: any) {
      console.error('Error fetching credits balance:', error);
      return {
        success: false,
        message: 'Failed to fetch credits balance',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
}