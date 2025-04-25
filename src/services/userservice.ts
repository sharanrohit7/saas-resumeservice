import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

  
export interface UpsertUserParams  {
  email: string;
  refreshToken?: string;
  authProvider?: 'GOOGLE' | 'EMAIL';
  firebaseUID?: string;
  country?: string;
  photoURL?: string;
};

export async function upsertUser(data: UpsertUserParams) {
  try {
    if (!data.email) {
      throw new Error('Email is required');
    }

    // Start a Prisma transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create or update the user
      const user = await prisma.users.upsert({
        where: { email: data.email },
        update: {
          // refreshToken is not a valid field for update
          // ...(data.refreshToken ? { refreshToken: data.refreshToken } : {}),
          updatedAt: new Date(),
          photourl: data.photoURL,
        },
        create: {
          id: crypto.randomUUID(), // Generate a unique ID for the user
          email: data.email,
          authProvider: data.authProvider || 'GOOGLE',
          createdAt: new Date(),
          updatedAt: new Date(),
          // refreshToken: data.refreshToken,
          firebaseUID: data.firebaseUID,
          country: data.country || 'IN',
          photourl: data.photoURL,
        }
      });

      // Check if a subscription already exists for the free plan
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          planId: 'basic_monthly',
        }
      });

      // If the user does not already have a subscription, create one
      if (!existingSubscription) {
        const fiveYearsLater = new Date();
        fiveYearsLater.setFullYear(fiveYearsLater.getFullYear() + 5);

        await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: 'basic_monthly',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: fiveYearsLater,
            countryCode: user.country || 'IN'
          }
        });
      }

      // Return the created or updated user
      return user;
    });

    return result;

  } catch (error) {
    console.error('Error in upsertUser:', error);
    throw new Error('Failed to upsert user');
  }
}

