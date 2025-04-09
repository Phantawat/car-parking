// /pages/findparkingspot.tsx (redirects to /ticket/[ticketId] after parking)
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';

interface ParkingLot {
  _id: string;
  name: string;
}

interface ParkingLevel {
  _id: string;
  name: string;
  level: number;
  capacity: number;
  availableSpaces: number;
  parkingLotId: string;
  isOpen: boolean;
}

export default function FindParkingSpotPage() {
  const router = useRouter();
  const { vehicleId } = router.query;
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [levels, setLevels] = useState<ParkingLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<ParkingLevel | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    const res = await fetch('/api/parking-lots');
    const lotsData = await res.json();
    setLots(lotsData);

    const res2 = await fetch('/api/parking-levels');
    const levelsData = await res2.json();
    setLevels(levelsData.filter((l: ParkingLevel) => l.isOpen && l.availableSpaces > 0));
  };

  const handlePark = async (level: ParkingLevel) => {
    try {
      const res = await fetch(`/api/user/ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelId: level._id, vehicleId })
      });

      if (!res.ok) throw new Error('Failed to park vehicle');

      const ticket = await res.json();
      setSelectedLevel(level);
      setMessage('Vehicle parked successfully! 🎉');

      // Redirect to individual ticket page
      router.push(`/ticket/${ticket._id}`);
    } catch (err) {
      setMessage('Failed to park vehicle 😢');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-pink-100 to-blue-100 text-black font-[Comic_Sans_MS,cursive]">
      <h1 className="text-2xl font-bold text-center text-pink-600 mb-6">
        🚗 Find a Parking Spot
      </h1>

      {message && (
        <div className="text-center mb-4 text-green-700">
          <CheckCircle className="inline mr-2" /> {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {levels.map((level) => {
          const lot = lots.find(l => l._id === level.parkingLotId);
          return (
            <div key={level._id} className="bg-white p-4 rounded-2xl shadow-lg">
              <h2 className="font-bold text-lg text-purple-700">{lot?.name}</h2>
              <p className="text-sm text-gray-600">Level: {level.name}</p>
              <p className="text-sm">Available Spaces: {level.availableSpaces}</p>
              <button
                onClick={() => handlePark(level)}
                disabled={!!selectedLevel}
                className="mt-3 px-4 py-2 bg-pink-400 text-white rounded hover:bg-pink-500 disabled:opacity-50"
              >
                Park Here
              </button>
            </div>
          );
        })}

        {levels.length === 0 && (
          <p className="text-center col-span-2 text-gray-500">
            No available spots found. Try again later 🥺
          </p>
        )}
      </div>
    </div>
  );
}
