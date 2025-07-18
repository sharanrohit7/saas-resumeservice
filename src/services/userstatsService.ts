import { UUID } from "crypto";
import { PrismaClient } from "../../prisma/generated/prisma";


const prisma = new PrismaClient();

export async function getRecentTop5Scores(userId: string) {
  const results = await prisma.resume_analysis.findMany({
    where: {
      user_id: userId, // Optional: remove this if you want all users
    },
    orderBy: {
      created_at: "desc", // -1 equivalent
    },
    take: 5, // top 5 recent
    select: {
      id: true,
      job_title: true,
      company_name: true,
      score_breakdown: true,
      created_at: true,
    },
  });

  // Optional: Clean/transform the score_breakdown if needed
  return results.map((item: any) => {
    const breakdown = item.score_breakdown as {
      ats_score: number;
      //   components: {
      //     keywords: number;
      //     education: number;
      //     experience: number;
      //     culture_fit: number;
      //   };
    };

    return {
      analysis_id: item.id,
      job_title: item.job_title,
      company_name: item.company_name,
      ats_score: breakdown.ats_score,
      //   keywords: breakdown.components.keywords,
      //   education: breakdown.components.education,
      //   experience: breakdown.components.experience,
      //   culture_fit: breakdown.components.culture_fit,
      created_at: item.created_at,
    };
  });
}



export const getDetailedAnalysisService = async (analysisId: string, user_id: string) => {
  // Basic validation: check UUID format
  if (!isValidUUID(analysisId) ) {
    throw new Error('Invalid UUID format');
  }

  const result = await prisma.resume_analysis.findFirst({
    where: {
      id: analysisId,
      user_id,
    },
  });

  return result;
};

// UUID checker (importable)
const isValidUUID = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
