import mongoose, { Schema, Document } from "mongoose";

export enum VehicleType {
    CAR = "car",
    MOTORCYCLE = "motorcycle",
    BUS = "bus",
}

export interface IVehicle extends Document {
    plate?: string;
    type: VehicleType;
    owner: string;
}

const VehicleSchema: Schema = new Schema({
    plate: { type: String, required: false, unique: true },
    type: { type: String, required: true, enum: Object.values(VehicleType) },
    owner: { type: String, required: true },
});

export default mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", VehicleSchema);
