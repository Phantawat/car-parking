// /pages/api/admin/generate-spots.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import ParkingLevel from '@/models/ParkingLevel';
import ParkingSpot from '@/models/ParkingSpot';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await dbConnect();

  const { levelId } = req.body;
  if (!levelId) return res.status(400).json({ error: 'Missing levelId' });

  try {
    const level = await ParkingLevel.findById(levelId);
    if (!level) return res.status(404).json({ error: 'Level not found' });

    const count = req.body.count || 10; // Default to 10 if not provided
    if (count <= 0) return res.status(400).json({ error: 'Count must be greater than 0' });
    
    const spots = [];
    for (let i = 1; i <= count; i++) {
      spots.push({
        number: `L${level.level}-${i}`,
        level: level.level,
        isOccupied: false
      });
    }

    await ParkingSpot.insertMany(spots);

    level.availableSpaces += count;
    await level.save();

    res.status(200).json({ message: 'Spots created', count, level: level.level });
  } catch (err) {
    console.error('[Generate Spots]', err);
    res.status(500).json({ error: 'Failed to generate spots' });
  }
}