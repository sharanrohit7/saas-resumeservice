import { UUID } from "crypto";
import { PrismaClient } from "../../prisma/generated/prisma";

const prisma = new PrismaClient();
// export const getAllPlans = async(){

// }

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