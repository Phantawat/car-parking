import mongoose, { Schema, Document } from "mongoose";

export interface IParkingLot extends Document {
  name: string;
  address: string;
  capacity: number;
  hourlyRate: number;
  description?: string;
  isActive: boolean;
}

const ParkingLotSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  capacity: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

export default mongoose.models.ParkingLot || mongoose.model("ParkingLot", ParkingLotSchema);