// pages/api/parking-lots/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import ParkingLot from '@/models/ParkingLot';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    // GET - Retrieve all parking lots
    case 'GET':
      try {
        const parkingLots = await ParkingLot.find({});
        return res.status(200).json(parkingLots);
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to get parking lots: ${error.message}` });
      }
    
    // POST - Create a new parking lot
    case 'POST':
      try {
        const parkingLot = await ParkingLot.create(req.body);
        return res.status(201).json(parkingLot);
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to create parking lot: ${error.message}` });
      }
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}