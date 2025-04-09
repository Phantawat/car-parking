import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle } from 'lucide-react';

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

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    type: VehicleType.CAR
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCreateVehicle = async () => {
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create vehicle');
      }

      const createdVehicle = await response.json();
      setVehicles([...vehicles, createdVehicle]);
      setNewVehicle({ type: VehicleType.CAR });
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const openAddDialog = () => {
    setNewVehicle({
      type: VehicleType.CAR,
      plate: `VEH-${Math.floor(Math.random() * 10000)}`
    });
    setIsDialogOpen(true);
  };

  const handleDeleteVehicle = async (_id: string) => {
    try {
      const response = await fetch(`/api/vehicles/${_id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete vehicle`);
      }
      setVehicles(vehicles.filter(vehicle => vehicle._id !== _id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getVehicleEmoji = (type: VehicleType) => {
    switch (type) {
      case VehicleType.CAR: return "🚗";
      case VehicleType.MOTORCYCLE: return "🏍️";
      case VehicleType.BUS: return "🚌";
      default: return "🚘";
    }
  };

  return (
    <div className="bg-gradient-to-tr from-pink-100 to-blue-100 min-h-screen p-6 text-black font-[Comic_Sans_MS,cursive]">
      <div className="text-center mb-6">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/1995/1995522.png" 
          alt="Cute Car" 
          className="w-24 mx-auto mb-2 animate-bounce" 
        />
        <h1 className="text-3xl font-bold text-pink-700 drop-shadow-sm">Vehicle Management 🧸</h1>
        <p className="text-gray-600 mt-1">Manage your tiny cars 💖</p>
      </div>

      <div className="bg-white shadow-lg rounded-3xl p-6 max-w-5xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-purple-600">Your Vehicles</h2>
          <button
            onClick={openAddDialog}
            className="flex items-center px-4 py-2 bg-pink-400 text-white rounded-xl shadow hover:bg-pink-500 transition"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Vehicle
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-xl">{error}</div>
        )}

        <table className="w-full table-auto bg-pink-50 rounded-xl overflow-hidden text-sm shadow-sm">
          <thead className="bg-pink-200 text-pink-900">
            <tr>
              <th className="p-3 text-left">Plate</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id} className="hover:bg-pink-100 transition">
                <td className="p-3">{v.plate}</td>
                <td className="p-3">{getVehicleEmoji(v.type)} {v.type}</td>
                <td className="p-3">{v.owner}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDeleteVehicle(v._id || '')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {vehicles.length === 0 && (
          <div className="text-center text-gray-500">No vehicles yet. Add one above! 🥺</div>
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-96 space-y-4">
            <h3 className="text-lg font-bold text-pink-600">✨ Add a New Vehicle</h3>

            <div>
              <label className="block mb-1 text-gray-700">Plate</label>
              <input
                type="text"
                value={newVehicle.plate || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Owner</label>
              <input
                type="text"
                value={newVehicle.owner || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, owner: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Type</label>
              <select
                value={newVehicle.type}
                onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value as VehicleType })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {Object.values(VehicleType).map((type) => (
                  <option key={type} value={type}>
                    {getVehicleEmoji(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVehicle}
                disabled={!newVehicle.owner}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
              >
                <PlusCircle className="inline mr-1 h-4 w-4" /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
