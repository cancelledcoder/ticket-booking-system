import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

interface Seat {
  id: number;
  isBooked: boolean;
}

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { seatNumbers } = await request.json();

    // Validate input
    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0 || seatNumbers.length > 7) {
      return NextResponse.json(
        { error: 'Invalid seat numbers. You can book between 1 and 7 seats.' },
        { status: 400 }
      );
    }

    // Check if seats are available
    const seats = await prisma.seat.findMany({
      where: {
        id: { in: seatNumbers },
      },
    });

    const bookedSeats = seats.filter((seat: Seat) => seat.isBooked);
    if (bookedSeats.length > 0) {
      return NextResponse.json(
        { error: `Seats ${bookedSeats.map((seat: Seat) => seat.id).join(', ')} are already booked.` },
        { status: 400 }
      );
    }

    // Book the seats
    const bookings = await prisma.$transaction(
      seatNumbers.map((seatId) =>
        prisma.seat.update({
          where: { id: seatId },
          data: { isBooked: true },
        })
      )
    );

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to book seats. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const seats = await prisma.seat.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(seats);
  } catch (error) {
    console.error('Error fetching seats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seats. Please try again.' },
      { status: 500 }
    );
  }
} 