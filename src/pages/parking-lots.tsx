// pages/parking-lots.tsx (cute version)
import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, Edit, Layers } from 'lucide-react';
import Link from 'next/link';

interface ParkingLot {
  _id?: string;
  name: string;
  address: string;
  capacity: number;
  hourlyRate: number;
  description?: string;
  isActive: boolean;
}

export default function ParkingLotPage() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [newParkingLot, setNewParkingLot] = useState<Partial<ParkingLot>>({ isActive: true });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { fetchParkingLots(); }, []);

  const fetchParkingLots = async () => {
    try {
      const response = await fetch('/api/parking-lots');
      if (!response.ok) throw new Error('Failed to fetch parking lots');
      const data = await response.json();
      setParkingLots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSaveParkingLot = async () => {
    try {
      let response;
      if (editingId) {
        response = await fetch(`/api/parking-lots/${editingId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newParkingLot),
        });
      } else {
        response = await fetch('/api/parking-lots', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newParkingLot),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save parking lot');
      }

      const savedParkingLot = await response.json();
      if (editingId) {
        setParkingLots(parkingLots.map(lot => lot._id === editingId ? savedParkingLot : lot));
      } else {
        setParkingLots([...parkingLots, savedParkingLot]);
      }

      setNewParkingLot({ isActive: true });
      setIsDialogOpen(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteParkingLot = async (_id: string) => {
    if (!confirm('Are you sure you want to delete this parking lot?')) return;
    try {
      const response = await fetch(`/api/parking-lots/${_id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete parking lot`);
      }
      setParkingLots(parkingLots.filter(lot => lot._id !== _id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEditParkingLot = (lot: ParkingLot) => {
    setNewParkingLot({ ...lot });
    setEditingId(lot._id ?? null);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setNewParkingLot({ isActive: true });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="bg-gradient-to-tr from-pink-100 to-blue-100 min-h-screen p-6 text-black font-[Comic_Sans_MS,cursive]">
      <div className="text-center mb-6">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/1995/1995522.png" 
          alt="Cute Car" 
          className="w-24 mx-auto mb-2 animate-bounce" 
        />
        <h1 className="text-3xl font-bold text-pink-700 drop-shadow-sm">Manage Your Lots 🅿️💖</h1>
        <p className="text-gray-600">Organize your parking world!</p>
      </div>

      <div className="bg-white shadow-xl rounded-3xl p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-600">Parking Lots</h2>
          <button
            onClick={openAddDialog}
            className="flex items-center px-4 py-2 bg-pink-400 text-white rounded-xl shadow hover:bg-pink-500 transition"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Lot
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded-xl">{error}</div>}

        <table className="w-full table-auto bg-pink-50 rounded-xl overflow-hidden text-sm shadow-sm">
          <thead className="bg-pink-200 text-pink-900">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">Capacity</th>
              <th className="p-3 text-left">Rate ($/hr)</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parkingLots.map((lot) => (
              <tr key={lot._id} className="hover:bg-pink-100 transition">
                <td className="p-3">{lot.name}</td>
                <td className="p-3">{lot.address}</td>
                <td className="p-3">{lot.capacity}</td>
                <td className="p-3">${lot.hourlyRate.toFixed(2)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${lot.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {lot.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end space-x-2">
                    <Link href={`/parking-levels?lotId=${lot._id}`}>
                      <button className="text-blue-500 hover:text-blue-700">
                        <Layers className="h-5 w-5" />
                      </button>
                    </Link>
                    <button onClick={() => handleEditParkingLot(lot)} className="text-yellow-500 hover:text-yellow-700">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteParkingLot(lot._id || '')} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {parkingLots.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No parking lots found 🥺 Try adding one!
          </div>
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-96 space-y-4">
            <h3 className="text-lg font-bold text-pink-600">
              {editingId ? 'Edit Parking Lot' : 'Add a Cute New Lot'}
            </h3>

            <input type="text" placeholder="Name" className="w-full px-3 py-2 border rounded-lg" value={newParkingLot.name || ''} onChange={e => setNewParkingLot({ ...newParkingLot, name: e.target.value })} />
            <input type="text" placeholder="Address" className="w-full px-3 py-2 border rounded-lg" value={newParkingLot.address || ''} onChange={e => setNewParkingLot({ ...newParkingLot, address: e.target.value })} />
            <input type="number" placeholder="Capacity" className="w-full px-3 py-2 border rounded-lg" value={newParkingLot.capacity || ''} onChange={e => setNewParkingLot({ ...newParkingLot, capacity: parseInt(e.target.value) })} />
            <input type="number" step="0.01" placeholder="Hourly Rate" className="w-full px-3 py-2 border rounded-lg" value={newParkingLot.hourlyRate || ''} onChange={e => setNewParkingLot({ ...newParkingLot, hourlyRate: parseFloat(e.target.value) })} />
            <textarea placeholder="Description" rows={3} className="w-full px-3 py-2 border rounded-lg" value={newParkingLot.description || ''} onChange={e => setNewParkingLot({ ...newParkingLot, description: e.target.value })}></textarea>

            <div className="flex items-center">
              <input type="checkbox" id="isActive" checked={newParkingLot.isActive || false} onChange={e => setNewParkingLot({ ...newParkingLot, isActive: e.target.checked })} className="mr-2" />
              <label htmlFor="isActive">Active</label>
            </div>

            <div className="flex justify-end space-x-2">
              <button onClick={() => { setIsDialogOpen(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
              <button onClick={handleSaveParkingLot} disabled={!newParkingLot.name || !newParkingLot.address || !newParkingLot.capacity || !newParkingLot.hourlyRate} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
                {editingId ? 'Update' : 'Add'} Lot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
