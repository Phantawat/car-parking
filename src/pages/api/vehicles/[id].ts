import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
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
    return res.status(400).json({ error: 'Invalid vehicle ID format' });
  }

  switch (method) {
    // GET - Retrieve a specific vehicle
    case 'GET':
      try {
        const vehicle = await Vehicle.findById(id);
        
        if (!vehicle) {
          return res.status(404).json({ error: 'Vehicle not found' });
        }
        
        return res.status(200).json(vehicle);
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to get vehicle: ${error.message}` });
      }
    
    // DELETE - Delete a vehicle
    case 'DELETE':
      try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(id);
        
        if (!deletedVehicle) {
          return res.status(404).json({ error: 'Vehicle not found' });
        }
        
        return res.status(200).json({ success: true, data: deletedVehicle });
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to delete vehicle: ${error.message}` });
      }
    
    // PUT - Update a vehicle
    case 'PUT':
      try {
        const vehicle = await Vehicle.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        
        if (!vehicle) {
          return res.status(404).json({ error: 'Vehicle not found' });
        }
        
        return res.status(200).json(vehicle);
      } catch (error: any) {
        return res.status(500).json({ error: `Failed to update vehicle: ${error.message}` });
      }
    
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}