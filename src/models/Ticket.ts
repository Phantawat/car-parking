// models/Ticket.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  vehicleId: mongoose.Types.ObjectId;
  level: number;
  lotName: string;
  startTime: Date;
  price?: number;
}

const TicketSchema = new Schema<ITicket>({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  level: { type: Number, required: true },
  lotName: { type: String, required: true },
  startTime: { type: Date, required: true },
  price: { type: Number, default: null },
});

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
