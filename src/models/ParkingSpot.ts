import mongoose, { Schema, Document } from "mongoose";

export interface IParkingSpot extends Document {
  number: string;
  level: number;
  isOccupied: boolean;
  vehicleId?: mongoose.Types.ObjectId;
}

const ParkingSpotSchema = new Schema<IParkingSpot>({
  number: { type: String, required: true, unique: true },
  level: { type: Number, required: true },
  isOccupied: { type: Boolean, default: false },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
});

export default mongoose.models.ParkingSpot ||
  mongoose.model<IParkingSpot>("ParkingSpot", ParkingSpotSchema);
