// pages/admin/tickets.tsx
import React, { useEffect, useState } from 'react';

interface Ticket {
  _id: string;
  vehicleId: string;
  level: number;
  lotName: string;
  startTime: string;
  price?: number;
}

export default function AdminTicketDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch('/api/admin/tickets')
      .then(res => res.json())
      .then(setTickets);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-lime-100 to-yellow-100 p-6 font-[Comic_Sans_MS,cursive]">
      <h1 className="text-3xl font-bold text-center text-yellow-700 mb-6">🎫 Ticket Dashboard</h1>

      <div className="bg-white shadow-xl rounded-3xl p-6 max-w-6xl mx-auto">
        <table className="w-full text-sm table-auto">
          <thead className="bg-yellow-200 text-yellow-900">
            <tr>
              <th className="p-2 text-left">Lot</th>
              <th className="p-2 text-left">Level</th>
              <th className="p-2 text-left">Spot</th>
              <th className="p-2 text-left">Vehicle</th>
              <th className="p-2 text-left">Start Time</th>
              <th className="p-2 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t._id} className="border-b hover:bg-yellow-50">
                <td className="p-2">{t.lotName}</td>
                <td className="p-2">{t.level}</td>
                <td className="p-2">{t.vehicleId}</td>
                <td className="p-2">{new Date(t.startTime).toLocaleString()}</td>
                <td className="p-2">{t.price !== undefined ? `$${t.price}` : '🅿️ Active'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No tickets found 🥺
          </div>
        )}
      </div>
    </div>
  );
}
