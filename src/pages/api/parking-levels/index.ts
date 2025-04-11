// pages/api/parking-levels/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import MongoDB from '@/lib/mongodb';
import ParkingLevel from '@/models/ParkingLevel';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const parkingLotId = query.parkingLotId as string;

  const dbConnect = MongoDB.getInstance();
  await dbConnect.connect();

  switch (method) {
    // GET - Retrieve all parking levels, optionally filtered by parking lot
    case 'GET':
      try {
        const filter = parkingLotId && mongoose.Types.ObjectId.isValid(parkingLotId) 
          ? { parkingLotId: new mongoose.Types.ObjectId(parkingLotId) } 
          : {};
          
        const parkingLevels = await ParkingLevel.find(filter);
        return res.status(200).json(parkingLevels);
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to get parking levels: ${error.message}` });
      }
    
    // POST - Create a new parking level
    case 'POST':
      try {
        // Validate parking lot ID if provided
        if (req.body.parkingLotId && !mongoose.Types.ObjectId.isValid(req.body.parkingLotId)) {
          return res.status(400).json({ error: 'Invalid parking lot ID format' });
        }
        
        const parkingLevel = await ParkingLevel.create(req.body);
        return res.status(201).json(parkingLevel);
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({ error: 'A level with this number already exists in this parking lot' });
        }
        return res.status(500).json({ error: `Failed to create parking level: ${error.message}` });
      }
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}