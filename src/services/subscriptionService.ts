import { BaseAnalysis, DeepAnalysis } from "../../Interface/analysis";




import { AnalysisReferenceData } from "../../Interface/dbServiceInterface";
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();


export const SaveAnalysisData = async (
  data: BaseAnalysis | DeepAnalysis,
  refData: AnalysisReferenceData
) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Common base data
      const analysisData: any = {
        resume_id: refData.resumeId,
        user_id: refData.userId,
        plan_type: refData.queryType,
        job_title: refData.job_title,
        company_name: refData.company_name,
        job_description: refData.job_desc,
        metadata: data.metadata,
        score_breakdown: data.score_breakdown,
        gap_analysis: data.gap_analysis,
        recommendations: data.recommendations,
        verification: data.verification_status,
        created_at: new Date(),
        updated_at: new Date()
      };

      // PRO-specific data
      if (refData.queryType === 'PRO' && 'deep_analysis' in data && 'readability_analysis' in data) {
        analysisData.deep_analysis = data.deep_analysis;
        analysisData.readability_analysis = data.readability_analysis;
      }

      // Save analysis data
      const newAnalysis = await tx.resume_analysis.create({
        data: analysisData
      });

      // Update user's analysis history
      await tx.userAnalysisHistory.create({
        data: {
          userId: refData.userId,
          analysisId: newAnalysis.id,
          analysisType: refData.queryType,
          snapshot: {
            jobTitle: refData.job_title,
            company: refData.company_name,
            date: new Date().toISOString()
          }
        }
      });

      return newAnalysis;
    });

    return result;
  } catch (err) {
    console.error("Error saving analysis data:", err);
    throw new Error("Failed to save resume analysis");
  } finally {
    await prisma.$disconnect();
  }
};

// export const SaveAnalysisData = async (
//   data: BaseAnalysis | DeepAnalysis,
//   refData: AnalysisReferenceData
// ) => {
//   try {
//     const result = await prisma.$transaction(async (tx) => {
//       // Common base data
//       const analysisData = {
//         resumeId: refData.resumeId,
//         analysisType: refData.queryType,
//         jobTitle: refData.job_title,
//         companyName: refData.company_name,
//         jobDescription: refData.job_desc,
//         metadata: {
//           job_title_analysis: data.metadata.job_title_analysis,
//           source_validation: data.metadata.source_validation
//         },
//         scoreBreakdown: data.score_breakdown,
//         gapAnalysis: data.gap_analysis,
//         recommendations: data.recommendations,
//         verification: data.verification_status,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         result: {} // Add a default or computed value for the 'result' property
//       };

//       // PRO-specific data
//       if (refData.queryType === 'PRO' && 'deep_analysis' in data) {
//         Object.assign(analysisData, {
//           deepAnalysis: data.deep_analysis,
//           readability: data.readability_analysis
//         });
//       }

//       const newAnalysis = await tx.resume_analysis.create({
//         data: analysisData
//       });

//       // Update user's analysis history
//       await tx.userAnalysisHistory.create({
//         data: {
//           userId: refData.userId,
//           analysisId: newAnalysis.id,
//           analysisType: refData.queryType,
//           snapshot: {
//             jobTitle: refData.job_title,
//             company: refData.company_name,
//             date: new Date().toISOString()
//           }
//         }
//       });

//       return newAnalysis;
//     });

//     return result;
//   } catch (err) {
//     console.error("Error saving analysis data:", err);
//     throw new Error("Failed to save resume analysis");
//   } finally {
//     await prisma.$disconnect();
//   }
// };