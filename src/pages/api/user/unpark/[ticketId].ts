// /pages/api/user/unpark/[ticketId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import ParkingSpot from '@/models/ParkingSpot';
import ParkingLevel from '@/models/ParkingLevel';
import Vehicle from '@/models/Vehicle';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ticketId } = req.query;
  await dbConnect();

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const spot = await ParkingSpot.findOne({ number: ticket.spotNumber });
  if (spot) {
    spot.isOccupied = false;
    spot.vehicleId = null;
    await spot.save();
  }

  const level = await ParkingLevel.findOne({ level: ticket.level });
  if (level) {
    level.availableSpaces += 1;
    await level.save();
  }

  // Optional: delete vehicle record
  await Vehicle.findByIdAndDelete(ticket.vehicleId);

  // ❗ Delete the ticket itself
  await Ticket.findByIdAndDelete(ticketId);

  res.status(200).json({
    message: 'Unparked successfully',
    spot: ticket.spotNumber,
    lot: ticket.lotName,
    freed: true,
  });

}
