// /pages/user.tsx (updated to redirect to /findparkingspot after vehicle creation)
import React, { useEffect, useState } from 'react';
import { CheckCircle, LogOut, TicketCheck, PlusCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

interface Ticket {
  _id: string;
  vehicleId: string;
  level: number;
  lotName: string;
  startTime: string;
  price?: number;
}

interface ParkingLevel {
  _id: string;
  name: string;
  level: number;
  availableSpaces: number;
  parkingLotId: string;
  isOpen: boolean;
}

interface ParkingLot {
  _id: string;
  name: string;
}

enum VehicleType {
  CAR = "car",
  MOTORCYCLE = "motorcycle",
  BUS = "bus"
}

interface Vehicle {
  _id?: string;
  plate: string;
  type: VehicleType;
  owner: string;
}

export default function UserPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState({ plate: '', owner: '', type: 'car' });
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [levels, setLevels] = useState<ParkingLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({ type: VehicleType.CAR });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetch('/api/parking-lots').then(res => res.json()).then(setLots);
    fetch('/api/parking-levels').then(res => res.json()).then(data => {
      setLevels(data.filter((l: ParkingLevel) => l.isOpen && l.availableSpaces > 0));
    });
  }, []);

  const handleUnpark = async () => {
    const res = await fetch(`/api/user/unpark/${ticket?._id}`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setTicket(data);
      setMessage(`You’ve successfully unparked! Total cost: $${data.price}`);
    } else {
      setMessage(data.error || 'Failed to unpark');
    }
  };

  const handleCreateVehicleAndRedirect = async () => {
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleInfo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create vehicle');
      }

      const createdVehicle = await response.json();
      setVehicles([...vehicles, createdVehicle]);
      setVehicleInfo({ plate: '', owner: '', type: 'car' });
      router.push(`/findparkingspot?vehicleId=${createdVehicle._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6 text-black font-[Comic_Sans_MS,cursive]">
      <h1 className="text-3xl font-bold text-center text-purple-600 mb-6">
        🎟️ Parking Ticket Portal
      </h1>

      {message && (
        <div className="text-center mb-4 text-green-700">
          <CheckCircle className="inline mr-2" /> {message}
        </div>
      )}

      {loading && <p className="text-center">Creating your ticket... 🌀</p>}

      {!ticket && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">🚘 Enter Vehicle Info</h2>

          <input
            className="w-full p-2 border rounded"
            placeholder="Plate Number"
            value={vehicleInfo.plate}
            onChange={e => setVehicleInfo({ ...vehicleInfo, plate: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Owner Name"
            value={vehicleInfo.owner}
            onChange={e => setVehicleInfo({ ...vehicleInfo, owner: e.target.value })}
          />
          <select
            className="w-full p-2 border rounded"
            value={vehicleInfo.type}
            onChange={e => setVehicleInfo({ ...vehicleInfo, type: e.target.value })}
          >
            <option value="car">🚗 Car</option>
            <option value="motorcycle">🏍️ Motorcycle</option>
            <option value="bus">🚌 Bus</option>
          </select>

          <button
            onClick={handleCreateVehicleAndRedirect}
            disabled={!vehicleInfo.plate || !vehicleInfo.owner}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 mt-4 flex justify-center items-center"
          >
            <ArrowRight className="mr-2 h-5 w-5" /> Go to Find Parking Spot
          </button>
        </div>
      )}
    </div>
  );
}
