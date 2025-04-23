'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Seat {
  id: number;
  isBooked: boolean;
}

interface Row {
  seats: Seat[];
}

export default function Home() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [numberOfSeats, setNumberOfSeats] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [useAutoSelect, setUseAutoSelect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      console.log('Fetching seats...');
      const response = await fetch('/api/seats');
      if (!response.ok) {
        console.error('Failed to fetch seats:', response.status, response.statusText);
        throw new Error('Failed to fetch seats');
      }
      const data = await response.json();
      console.log('Fetched seats:', data);
      setSeats(data);
    } catch (err) {
      console.error('Error fetching seats:', err);
      setError('Failed to load seats. Please try again.');
    }
  };

  const handleSeatClick = (seatId: number) => {
    setError('');
    if (seats.find(seat => seat.id === seatId)?.isBooked) {
      return;
    }

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      }
      if (prev.length >= 7) {
        alert('You can only select up to 7 seats at a time');
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const findSeatsInRow = (numSeats: number) => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const availableSeats = row.filter(seat => !seat.isBooked);
      if (availableSeats.length >= numSeats) {
        return availableSeats.slice(0, numSeats).map(seat => seat.id);
      }
    }
    return null;
  };

  const findNearbySeats = (numSeats: number) => {
    const availableSeats = seats.filter(seat => !seat.isBooked);
    if (availableSeats.length < numSeats) return null;

    // Try to find seats with minimum distance between them
    let bestSeats: number[] = [];
    let minDistance = Infinity;

    for (let i = 0; i < availableSeats.length - numSeats + 1; i++) {
      const currentSeats = availableSeats.slice(i, i + numSeats);
      const distance = currentSeats[numSeats - 1].id - currentSeats[0].id;
      
      if (distance < minDistance) {
        minDistance = distance;
        bestSeats = currentSeats.map(seat => seat.id);
      }
    }

    return bestSeats;
  };

  const handleNumberChange = (num: string) => {
    const numSeats = parseInt(num) || 0;
    setNumberOfSeats(num);
    setError('');

    if (numSeats < 1 || numSeats > 7) {
      return;
    }

    if (useAutoSelect) {
      // Try to find seats in one row first
      const rowSeats = findSeatsInRow(numSeats);
      if (rowSeats) {
        setSelectedSeats(rowSeats);
        return;
      }

      // If no seats available in one row, find nearby seats
      const nearbySeats = findNearbySeats(numSeats);
      if (nearbySeats) {
        setSelectedSeats(nearbySeats);
        return;
      }
    }

    // If auto-select is off or no suitable seats found, just select first available seats
    const availableSeats = seats
      .filter(seat => !seat.isBooked && !selectedSeats.includes(seat.id))
      .slice(0, numSeats)
      .map(seat => seat.id);

    setSelectedSeats(availableSeats);
  };

  const handleBooking = async () => {
    if (!selectedSeats.length) {
      setError('Please select at least one seat to book');
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatNumbers: selectedSeats }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          setError('Please login to book seats');
          router.push('/auth/login');
          return;
        }
        if (response.status === 409) {
          setError('One or more seats are already booked. Please try again.');
          fetchSeats(); // Refresh seat status
          return;
        }
        throw new Error(data.error || 'Failed to book seats. Please try again.');
      }

      setSuccessMessage(`Successfully booked ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}`);
      setSelectedSeats([]);
      setNumberOfSeats('');
      await fetchSeats(); // Refresh seats
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleReset = () => {
    setSelectedSeats([]);
    setNumberOfSeats('');
    setError('');
  };

  const handleResetAllSeats = async () => {
    try {
      const response = await fetch('/api/seats/reset', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset seats');
      }

      const data = await response.json();
      setSeats(data.seats);
      setSuccessMessage('All seats have been reset to available');
      handleReset();

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset seats');
    }
  };

  // Generate rows of seats
  const rows: Seat[][] = [];
  const seatsPerRow = 7;
  const totalRows = Math.ceil(seats.length / seatsPerRow);
  
  for (let i = 0; i < totalRows; i++) {
    const isLastRow = i === totalRows - 1;
    const seatsInThisRow = isLastRow ? 3 : seatsPerRow;
    const rowSeats = seats.slice(i * seatsPerRow, i * seatsPerRow + seatsInThisRow);
    rows.push(rowSeats);
  }

  console.log('Current seats state:', { seats, rows, selectedSeats });

  return (
    <main className="main">
      <div>
        <h1 className="title">Train Ticket Booking</h1>
        
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
          {/* Seat Grid */}
          <div className="seat-grid">
            <div className="grid">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                  {row.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.isBooked}
                      className={`seat ${
                        seat.isBooked 
                          ? 'booked' 
                          : selectedSeats.includes(seat.id) 
                            ? 'selected' 
                            : 'available'
                      }`}
                      style={{ cursor: seat.isBooked ? 'not-allowed' : 'pointer' }}
                    >
                      {seat.id}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Seat Counters */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ backgroundColor: '#fbbf24', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                Booked Seats = {seats.filter(seat => seat.isBooked).length}
              </div>
              <div style={{ backgroundColor: '#22c55e', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                Available Seats = {seats.filter(seat => !seat.isBooked).length}
              </div>
            </div>
          </div>

          {/* Booking Controls */}
          <div className="controls">
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={useAutoSelect}
                    onChange={(e) => setUseAutoSelect(e.target.checked)}
                  />
                  Auto-select nearby seats
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Book Seats</span>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberChange(num.toString())}
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      backgroundColor: numberOfSeats === num.toString() ? '#fbbf24' : '#e5e7eb',
                      color: numberOfSeats === num.toString() ? 'black' : '#4b5563',
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="7"
                value={numberOfSeats}
                onChange={(e) => handleNumberChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  marginBottom: '0.5rem',
                }}
                placeholder="Number of seats"
              />
              <button
                onClick={handleBooking}
                style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  marginBottom: '0.5rem',
                }}
              >
                Book
              </button>
              <button
                onClick={handleReset}
                style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  marginBottom: '0.5rem',
                }}
              >
                Reset Booking
              </button>
              <button
                onClick={handleResetAllSeats}
                style={{
                  width: '100%',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                }}
              >
                Reset All Seats
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="success">
            {successMessage}
          </div>
        )}
      </div>
    </main>
  );
} 