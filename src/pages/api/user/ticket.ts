// /pages/api/user/ticket.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import MongoDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import ParkingLevel from '@/models/ParkingLevel';
import ParkingLot from '@/models/ParkingLot';
import ParkingSpot from '@/models/ParkingSpot';
import Vehicle from '@/models/Vehicle';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const dbConnect = MongoDB.getInstance();
  await dbConnect.connect();
  const { plate, owner, type, levelId, vehicleId } = req.body;

  if (!levelId) return res.status(400).json({ error: 'Missing levelId' });

  try {
    const level = await ParkingLevel.findById(levelId);
    if (!level || !level.isOpen || level.availableSpaces === 0) {
      return res.status(400).json({ error: 'Selected level is full or closed' });
    }

    // Find the first available spot in that level
    const spot = await ParkingSpot.findOne({ level: level.level, isOccupied: false }).sort({ number: 1 });
    if (!spot) return res.status(400).json({ error: 'No available spots on this level' });

    let vehicle;

    if (vehicleId) {
      vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    } else if (plate && owner && type) {
      vehicle = await Vehicle.create({ plate, owner, type });
    } else {
      return res.status(400).json({ error: 'Missing vehicle info or vehicleId' });
    }

    // Occupy the spot
    spot.isOccupied = true;
    spot.vehicleId = vehicle._id;
    await spot.save();

    // Decrease level availability
    level.availableSpaces = Math.max(0, level.availableSpaces - 1);
    await level.save();

    const lot = await ParkingLot.findById(level.parkingLotId);

    const ticket = await Ticket.create({
      vehicleId: vehicle._id,
      spotNumber: spot.number,
      level: level.level,
      lotName: lot?.name || 'Unknown Lot',
      startTime: new Date(),
    });

    res.status(200).json(ticket);
  } catch (err) {
    console.error('[Ticket Error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}