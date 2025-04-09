// pages/api/parking-lots/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import ParkingLot from '@/models/ParkingLot';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const id = query.id as string;

  await dbConnect();

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid parking lot ID format' });
  }

  switch (method) {
    // GET - Retrieve a specific parking lot
    case 'GET':
      try {
        const parkingLot = await ParkingLot.findById(id);
        
        if (!parkingLot) {
          return res.status(404).json({ error: 'Parking lot not found' });
        }
        
        return res.status(200).json(parkingLot);
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to get parking lot: ${error.message}` });
      }
    
    // PUT - Update a parking lot
    case 'PUT':
      try {
        const parkingLot = await ParkingLot.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        
        if (!parkingLot) {
          return res.status(404).json({ error: 'Parking lot not found' });
        }
        
        return res.status(200).json(parkingLot);
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to update parking lot: ${error.message}` });
      }
    
    // DELETE - Delete a parking lot
    case 'DELETE':
      try {
        const deletedParkingLot = await ParkingLot.findByIdAndDelete(id);
        
        if (!deletedParkingLot) {
          return res.status(404).json({ error: 'Parking lot not found' });
        }
        
        return res.status(200).json({ success: true, data: deletedParkingLot });
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to delete parking lot: ${error.message}` });
      }
    
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}