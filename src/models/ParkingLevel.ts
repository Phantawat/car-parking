import mongoose, { Schema, Document } from "mongoose";

export interface IParkingLevel extends Document {
  parkingLotId: mongoose.Types.ObjectId;
  level: number;
  name: string;
  capacity: number;
  availableSpaces: number;
  isOpen: boolean;
}

const ParkingLevelSchema: Schema = new Schema({
  parkingLotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingLot', required: true },
  level: { type: Number, required: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  availableSpaces: { type: Number, required: true },
  isOpen: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Compound index to ensure unique levels per parking lot
ParkingLevelSchema.index({ parkingLotId: 1, level: 1 }, { unique: true });

export default mongoose.models.ParkingLevel || mongoose.model("ParkingLevel", ParkingLevelSchema);