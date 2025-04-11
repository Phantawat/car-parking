// /pages/api/admin/tickets.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import MongoDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const dbConnect = MongoDB.getInstance();
    await dbConnect.connect();
    const tickets = await Ticket.find().sort({ startTime: -1 });
    res.status(200).json(tickets);
  } catch (err) {
    console.error('[Admin Tickets]', err);
    res.status(500).json({ error: 'Failed to load tickets' });
  }
}