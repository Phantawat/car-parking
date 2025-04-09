import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import ParkingLevel from '@/models/ParkingLevel';
import ParkingLot from '@/models/ParkingLot';
import Vehicle from '@/models/Vehicle';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();

  const { plate, owner, type, levelId, vehicleId } = req.body;

  if (!levelId) return res.status(400).json({ error: 'Missing levelId' });

  try {
    const level = await ParkingLevel.findById(levelId);
    if (!level) return res.status(404).json({ error: 'Parking level not found' });

    let vehicle;

    // use existing vehicle
    if (vehicleId) {
      vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    } else if (plate && owner && type) {
      // create new vehicle
      vehicle = await Vehicle.create({ plate, owner, type });
    } else {
      return res.status(400).json({ error: 'Missing vehicle info or vehicleId' });
    }

    level.availableSpaces = Math.max(0, level.availableSpaces - 1);
    await level.save();

    const lot = await ParkingLot.findById(level.parkingLotId);

    const ticket = await Ticket.create({
      vehicleId: vehicle._id,
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
