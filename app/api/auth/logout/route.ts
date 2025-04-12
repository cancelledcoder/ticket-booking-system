import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the authentication token cookie
  cookies().delete('token');

  return NextResponse.json({ success: true });
} 