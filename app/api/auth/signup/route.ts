import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    console.log('Starting signup process...');
    
    const { email, password, name } = await req.json();
    console.log('Received signup data for:', email);

    // Input validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('Checking for existing user...');
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      }).catch((error: Error) => {
        console.error('Error checking existing user:', error);
        throw error;
      });
      console.log('Existing user check completed');

      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }
    } catch (findError) {
      console.error('Error during existing user check:', findError);
      throw findError;
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating new user...');
    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      }).catch((error: Error) => {
        console.error('Error creating user:', error);
        throw error;
      });
      console.log('User created successfully:', user.id);

      // Reset seats to available when a user signs up
      await prisma.seat.updateMany({
        data: { isBooked: false },
      });

      // Return success response
      return NextResponse.json(
        { 
          message: 'User created successfully', 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name 
          } 
        },
        { status: 201 }
      );
    } catch (createError) {
      console.error('Error during user creation:', {
        error: createError,
        errorMessage: (createError as Error).message,
        errorStack: (createError as Error).stack,
      });
      throw createError;
    }
  } catch (error) {
    console.error('Signup error details:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : 'Unknown',
    });
    
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Database initialization error:', {
        errorMessage: error.message,
        errorCode: error.errorCode,
        clientVersion: error.clientVersion,
      });
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Known Prisma error:', {
        code: error.code,
        meta: error.meta,
        message: error.message,
      });
      
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'This email is already registered' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Database error occurred. Please try again later.' },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      console.error('Unknown Prisma error:', error.message);
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
} 