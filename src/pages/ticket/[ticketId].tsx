// /pages/ticket/[ticketId].tsx with print PDF support
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { TicketCheck, Loader, LogOut, CheckCircle } from 'lucide-react';

interface Ticket {
  _id: string;
  spotNumber: string;
  level: number;
  lotName: string;
  startTime: string;
  price?: number;
}

export default function TicketInfoPage() {
  const router = useRouter();
  const { ticketId } = router.query;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    if (ticketId) {
      fetch(`/api/ticket/${ticketId}`)
        .then(res => res.json())
        .then(setTicket)
        .finally(() => setLoading(false));
    }
  }, [ticketId]);

  const handleUnpark = async () => {
    if (!ticket) return;
    const res = await fetch(`/api/user/unpark/${ticket._id}`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setTicket(data);
      setMessage(`Unparked successfully! Total cost: $${data.price}`);
    } else {
      setMessage(data.error || 'Failed to unpark');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-purple-700 font-[Comic_Sans_MS,cursive]">
        <Loader className="animate-spin mr-2" /> Loading Ticket Info...
      </div>
    );
  }

  if (!ticket) {
    return <div className="p-6 text-center text-red-600">Ticket not found ❌</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-100 p-6 text-black font-[Comic_Sans_MS,cursive]">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-6" ref={printRef}>
        <h1 className="text-2xl font-bold text-pink-600 flex items-center mb-4">
          <TicketCheck className="mr-2" /> Ticket Info
        </h1>

        {message && (
          <div className="text-green-700 mb-4 text-center">
            <CheckCircle className="inline mr-1" /> {message}
          </div>
        )}

        <p><strong>Lot:</strong> {ticket.lotName}</p>
        <p><strong>Level:</strong> {ticket.level}</p>
        <p><strong>Spot Number:</strong> {ticket.spotNumber}</p>
        <p><strong>Start Time:</strong> {new Date(ticket.startTime).toLocaleString()}</p>
        {ticket.price && <p><strong>Total Cost:</strong> ${ticket.price}</p>}
      </div>

      <div className="mt-4 flex justify-between max-w-xl mx-auto gap-2">
        {!ticket.price && (
          <button
            onClick={handleUnpark}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex justify-center items-center"
          >
            <LogOut className="mr-2" /> Unpark Vehicle
          </button>
        )}
      </div>
    </div>
  );
}