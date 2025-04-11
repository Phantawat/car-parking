// pages/api/parking-levels/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import MongoDB from '@/lib/mongodb';
import ParkingLevel from '@/models/ParkingLevel';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const id = query.id as string;

  const dbConnect = MongoDB.getInstance();
  await dbConnect.connect();

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid parking level ID format' });
  }

  switch (method) {
    // GET - Retrieve a specific parking level
    case 'GET':
      try {
        const parkingLevel = await ParkingLevel.findById(id).populate('parkingLotId');
        
        if (!parkingLevel) {
          return res.status(404).json({ error: 'Parking level not found' });
        }
        
        return res.status(200).json(parkingLevel);
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to get parking level: ${error.message}` });
      }
    
    // PUT - Update a parking level
    case 'PUT':
      try {
        const parkingLevel = await ParkingLevel.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        
        if (!parkingLevel) {
          return res.status(404).json({ error: 'Parking level not found' });
        }
        
        return res.status(200).json(parkingLevel);
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({ error: 'A level with this number already exists in this parking lot' });
        }
        return res.status(500).json({ error: `Failed to update parking level: ${error.message}` });
      }
    
    // DELETE - Delete a parking level
    case 'DELETE':
      try {
        const deletedParkingLevel = await ParkingLevel.findByIdAndDelete(id);
        
        if (!deletedParkingLevel) {
          return res.status(404).json({ error: 'Parking level not found' });
        }
        
        return res.status(200).json({ success: true, data: deletedParkingLevel });
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to delete parking level: ${error.message}` });
      }
    
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}