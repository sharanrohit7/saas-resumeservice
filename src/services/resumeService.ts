import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

interface CreateResumeInput {
  userId: string;
  title: string;
  content: any; // JSON content
  isDefault?: boolean;
  resume_url?: string;
}

export const createResume = async (input: CreateResumeInput) => {
  try {
    const newResume = await prisma.resume.create({
      data: {
        userId: input.userId,
        title: input.title,
        content: input.content,
        isDefault: input.isDefault ?? false,
        resume_url:input.resume_url
      }
    });

    return { success: true, data: newResume };
  } catch (error: any) {
    console.error('Error creating resume:', error);
    return { success: false, message: 'Failed to create resume', details: error.message };
  }
};


export const getResumeContentById = async (id: string) => {
    try {
      const resume = await prisma.resume.findUnique({
        where: { id },
        select: { content: true }
      });
  
      if (!resume) {
        return {
          success: false,
          message: 'Resume not found'
        };
      }
  
      return {
        success: true,
        content: resume.content
      };
    } catch (error: any) {
      console.error('Error fetching resume content:', error);
      return {
        success: false,
        message: 'Failed to fetch resume content',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  };


  export const getResumeById = async (id: string) => {
    try {
      const resume = await prisma.resume.findMany({
        where: { userId: id },
        select: { title: true, createdAt: true, resume_url:true}
      });
  
      if (!resume) {
        return {
          success: false,
          message: 'Resume not found'
        };
      }
  
      return {
        success: true,
        data: resume
      };
    } catch (error: any) {
      console.error('Error fetching resume:', error);
      return {
        success: false,
        message: 'Failed to fetch resume',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }