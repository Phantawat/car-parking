// /pages/api/spots.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import ParkingSpot from '@/models/ParkingSpot';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await dbConnect();
    const spots = await ParkingSpot.find().sort({ level: 1, number: 1 });
    res.status(200).json(spots);
  } catch (err) {
    console.error('[Get Spots]', err);
    res.status(500).json({ error: 'Failed to load parking spots' });
  }
}
