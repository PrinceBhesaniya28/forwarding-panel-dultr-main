import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's numbers
    const userNumbers = await prisma.number.findMany({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    // Disable all user's numbers
    await Promise.all(
      userNumbers.map(number =>
        prisma.number.update({
          where: { id: number.id },
          data: { status: 'DISABLED' }
        })
      )
    );

    // Update user status
    await prisma.user.update({
      where: { email: session.user.email },
      data: { status: 'DISABLED' }
    });

    return new NextResponse('Account disabled successfully', { status: 200 });
  } catch (error) {
    console.error('Error disabling user account:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 