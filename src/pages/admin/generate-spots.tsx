// /pages/admin/generate-spots.tsx
import React, { useEffect, useState } from 'react';

interface ParkingLevel {
  _id: string;
  name: string;
  level: number;
  parkingLotId: string;
}

export default function GenerateSpotsPage() {
  const [levels, setLevels] = useState<ParkingLevel[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/parking-levels')
      .then(res => res.json())
      .then(setLevels);
  }, []);

  const generateSpots = async (levelId: string) => {
    const res = await fetch(`/api/admin/generate-spots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelId })
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`✅ ${data.count} spots created for Level ${data.level}`);
    } else {
      setMessage(data.error || 'Something went wrong 😢');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-yellow-100 to-pink-100 text-black font-[Comic_Sans_MS,cursive]">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">🛠️ Generate Parking Spots</h1>

      {message && <div className="text-center mb-4 text-green-700">{message}</div>}

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {levels.map(level => (
          <div key={level._id} className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-purple-700">Level {level.level}</h2>
            <p className="text-sm text-gray-600">{level.name}</p>
            <button
              className="mt-3 w-full px-4 py-2 bg-pink-400 text-white rounded hover:bg-pink-500"
              onClick={() => generateSpots(level._id)}
            >
              🚗 Generate 10 Spots
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}