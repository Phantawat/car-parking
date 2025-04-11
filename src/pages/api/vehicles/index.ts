import { NextApiRequest, NextApiResponse } from 'next';
import Vehicle, { IVehicle, VehicleType } from '@/models/Vehicle';
import mongoose from 'mongoose';
import MongoDB from '@/lib/mongodb';

export const createVehicle = async (vehicleData: Partial<IVehicle>) => {
  // Validate required fields
  if (!vehicleData.plate || !vehicleData.owner) {
    throw new Error('Plate and owner are required fields');
  }

  try {
    const vehicle = new Vehicle({
      plate: vehicleData.plate,
      type: vehicleData.type || VehicleType.CAR,
      owner: vehicleData.owner
    });
    return await vehicle.save();
  } catch (error: any) {
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      throw new Error(`Validation Error: ${validationErrors.join(', ')}`);
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      throw new Error('A vehicle with this plate already exists');
    }

    // Generic error handling
    throw new Error(`Failed to create vehicle: ${error.message}`);
  }
};

export const deleteVehicle = async (_id: string) => {
  console.log("Attempting to delete vehicle with ID:", _id);
  
  if (!_id) {
    throw new Error('Vehicle ID is required');
  }

  try {
    const objectId = new mongoose.Types.ObjectId(_id);
    console.log("Created ObjectId:", objectId);
    
    const deletedVehicle = await Vehicle.findByIdAndDelete(objectId);
    console.log("Delete result:", deletedVehicle);
    
    if (!deletedVehicle) {
      throw new Error('Vehicle not found');
    }
    
    return deletedVehicle;
  } catch (error: any) {
    console.error("Delete error:", error);
    throw new Error(`Failed to delete vehicle: ${error.message}`);
  }
};

export const getVehicleById = async (_id: string) => {
  if (!_id) {
    throw new Error('Vehicle ID is required');
  }

  try {
    const vehicle = await Vehicle.findById(_id);
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    return vehicle;
  } catch (error: any) {
    throw new Error(`Failed to fetch vehicle: ${error.message}`);
  }
};

export const getAllVehicles = async () => {
  try {
    return await Vehicle.find({});
  } catch (error: any) {
    throw new Error(`Failed to fetch vehicles: ${error.message}`);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure res is defined before using it
  if (!res) {
    console.error('Response object is undefined');
    return;
  }

  try {
    // Establish database connection
    const dbConnect = MongoDB.getInstance();
    await dbConnect.connect();
  } catch (connectionError) {
    // Check if res is defined before calling methods
    if (res) {
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: connectionError instanceof Error ? connectionError.message : 'Unknown error'
      });
    }
    return;
  }

  const { method } = req;

  // Add a catch-all error handler
  try {
    switch (method) {
      case 'POST':
        try {
          const vehicle = await createVehicle(req.body);
          return res.status(201).json(vehicle);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return res.status(400).json({ 
            error: errorMessage,
            code: 'VEHICLE_CREATE_ERROR'
          });
        }

      case 'GET':
        try {
          const vehicles = await getAllVehicles();
          return res.status(200).json(vehicles);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          return res.status(500).json({ 
            error: errorMessage,
            code: 'VEHICLE_FETCH_ERROR'
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ 
          error: `Method ${method} Not Allowed`,
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (globalError) {
    // Catch any unexpected errors
    console.error('Unhandled error in vehicle API:', globalError);
    
    // Ensure res is defined before using it
    if (res) {
      return res.status(500).json({
        error: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}