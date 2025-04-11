// /pages/api/tickets/[ticketId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import MongoDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const dbConnect = MongoDB.getInstance();
  await dbConnect.connect();

  const { ticketId } = req.query;

  try {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json(ticket);
  } catch (err) {
    console.error('[Get Ticket]', err);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
}
