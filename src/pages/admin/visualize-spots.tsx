// /pages/admin/visualize-spots.tsx
import React, { useEffect, useState } from 'react';

interface Spot {
  _id: string;
  number: string;
  level: number;
  isOccupied: boolean;
}

export default function SpotVisualizer() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [levels, setLevels] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/spots')
      .then(res => res.json())
      .then(data => {
        setSpots(data);
        const uniqueLevels = Array.from(new Set(data.map((s: Spot) => s.level))) as number[];
        setLevels(uniqueLevels);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-blue-100 p-6 text-black font-[Comic_Sans_MS,cursive]">
      <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
        🗺️ Spot Visualization
      </h1>

      {levels.map(level => (
        <div key={level} className="mb-10">
          <h2 className="text-xl font-semibold text-purple-600 mb-2">Level {level}</h2>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {spots.filter(s => s.level === level).map(s => (
              <div
                key={s._id}
                className={`rounded-xl px-3 py-2 text-sm text-center font-semibold shadow-md transition duration-300
                  ${s.isOccupied ? 'bg-red-400 text-white' : 'bg-green-300 text-black'}`}
              >
                {s.number}
              </div>
            ))}
          </div>
        </div>
      ))}

      {levels.length === 0 && (
        <p className="text-center text-gray-600 mt-10">No parking spots found 💤</p>
      )}
    </div>
  );
}
