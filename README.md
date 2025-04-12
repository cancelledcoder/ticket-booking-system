# Train Ticket Booking System

A modern web application for booking train tickets, built with Next.js, TypeScript, and Prisma.

## Features

- Interactive seat selection interface
- Real-time seat availability status
- Auto-select nearby seats functionality
- Book up to 7 seats at once
- User authentication
- Responsive design

## Tech Stack

- **Frontend:** Next.js, TypeScript, React
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Custom JWT-based auth
- **Styling:** CSS Modules

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ticket-booking-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
DATABASE_URL="postgresql://username:password@localhost:5432/ticket_booking"
JWT_SECRET="your-jwt-secret"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

This project is deployed on Netlify. The live version can be accessed at: [Live Demo](your-netlify-url)

## Contributing

Feel free to submit issues and enhancement requests.

## License

MIT License - feel free to use this project for any purpose.
