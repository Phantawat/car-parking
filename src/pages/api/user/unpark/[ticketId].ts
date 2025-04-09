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

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.price) return res.status(400).json({ error: 'Ticket already paid' });

    const spot = await ParkingSpot.findOne({ number: ticket.spotNumber });
    const level = await ParkingLevel.findOne({ level: ticket.level });

    if (spot && spot.isOccupied) {
      spot.isOccupied = false;
      spot.vehicleId = null;
      await spot.save();

      if (level) {
        level.availableSpaces += 1;
        await level.save();
      }
    }

    const endTime = new Date();
    const durationHours = Math.ceil((endTime.getTime() - new Date(ticket.startTime).getTime()) / (1000 * 60 * 60));
    const pricePerHour = 20; // You can make this dynamic from lot later
    const total = durationHours * pricePerHour;

    ticket.price = total;
    await ticket.save();

    // Optional: delete the vehicle
    await Vehicle.findByIdAndDelete(ticket.vehicleId);

    res.status(200).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unpark and calculate cost' });
  }
}
