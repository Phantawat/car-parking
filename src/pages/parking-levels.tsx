// pages/parking-levels.tsx (enhanced with admin nav & auto spot gen)
import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, Edit, ArrowLeft, Ticket, Map, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface ParkingLot {
  _id: string;
  name: string;
}

interface ParkingLevel {
  _id?: string;
  parkingLotId: string;
  level: number;
  name: string;
  capacity: number;
  availableSpaces: number;
  isOpen: boolean;
}

export default function ParkingLevelPage() {
  const router = useRouter();
  const { lotId } = router.query;

  const [parkingLot, setParkingLot] = useState<ParkingLot | null>(null);
  const [parkingLevels, setParkingLevels] = useState<ParkingLevel[]>([]);
  const [newParkingLevel, setNewParkingLevel] = useState<Partial<ParkingLevel>>({ isOpen: true });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [spotCount, setSpotCount] = useState(10);

  useEffect(() => {
    if (lotId) {
      fetchParkingLot();
      fetchParkingLevels();
    }
  }, [lotId]);

  const fetchParkingLot = async () => {
    try {
      const response = await fetch(`/api/parking-lots/${lotId}`);
      if (!response.ok) throw new Error('Failed to fetch parking lot');
      const data = await response.json();
      setParkingLot(data);
      setNewParkingLevel(prev => ({ ...prev, parkingLotId: lotId as string }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchParkingLevels = async () => {
    try {
      const response = await fetch(`/api/parking-levels?parkingLotId=${lotId}`);
      if (!response.ok) throw new Error('Failed to fetch parking levels');
      const data = await response.json();
      setParkingLevels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSaveParkingLevel = async () => {
    try {
      const levelData = {
        ...newParkingLevel,
        capacity: Number(newParkingLevel.capacity),
        availableSpaces: Number(newParkingLevel.availableSpaces),
        level: Number(newParkingLevel.level),
        parkingLotId: lotId
      };

      let response;

      if (editingId) {
        response = await fetch(`/api/parking-levels/${editingId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(levelData),
        });
      } else {
        response = await fetch('/api/parking-levels', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(levelData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save parking level');
      }

      const savedParkingLevel = await response.json();
      if (editingId) {
        setParkingLevels(parkingLevels.map(level => level._id === editingId ? savedParkingLevel : level));
      } else {
        setParkingLevels([...parkingLevels, savedParkingLevel]);

        // Auto-generate spots after adding
        await fetch('/api/admin/generate-spots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ levelId: savedParkingLevel._id, count: spotCount })
        });
      }

      setNewParkingLevel({ isOpen: true, parkingLotId: lotId as string });
      setIsDialogOpen(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteParkingLevel = async (_id: string) => {
    if (!confirm('Are you sure you want to delete this parking level?')) return;
    try {
      const response = await fetch(`/api/parking-levels/${_id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete parking level`);
      }
      setParkingLevels(parkingLevels.filter(level => level._id !== _id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEditParkingLevel = (level: ParkingLevel) => {
    setNewParkingLevel({ ...level });
    setEditingId(level._id ?? null);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setNewParkingLevel({ 
      isOpen: true, 
      parkingLotId: lotId as string,
      level: parkingLevels.length > 0 ? Math.max(...parkingLevels.map(l => l.level)) + 1 : 1
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  if (!lotId) return <div className="p-4">Loading... 🌀</div>;

  return (
    <div className="bg-gradient-to-tr from-yellow-100 to-pink-200 min-h-screen p-6 text-black font-[Comic_Sans_MS,cursive]">
      <div className="text-center mb-6">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/1995/1995679.png" 
          alt="Cute Parking Icon" 
          className="w-20 mx-auto mb-2 animate-wiggle" 
        />
        <h1 className="text-3xl font-bold text-yellow-700 drop-shadow-sm">Manage Parking Levels 🅿️✨</h1>
        <p className="text-gray-600">Keep each floor neat and ready!</p>

        <div className="flex justify-center space-x-4 mt-4">
          <Link href="/admin/generate-spots"><button className="bg-purple-200 hover:bg-purple-300 px-4 py-2 rounded-xl flex items-center text-purple-700"><Wrench className="mr-2" /> Generate Spots</button></Link>
          <Link href="/admin/visualize-spots"><button className="bg-blue-200 hover:bg-blue-300 px-4 py-2 rounded-xl flex items-center text-blue-700"><Map className="mr-2" /> Visualize Spots</button></Link>
          <Link href="/admin/tickets"><button className="bg-green-200 hover:bg-green-300 px-4 py-2 rounded-xl flex items-center text-green-700"><Ticket className="mr-2" /> Ticket Dashboard</button></Link>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-3xl p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Link href="/parking-lots">
              <button className="flex items-center text-pink-500 hover:text-pink-700">
                <ArrowLeft className="h-5 w-5 mr-1" /> Back to Lots
              </button>
            </Link>
            <h2 className="ml-4 text-xl font-bold text-purple-600">
              {parkingLot ? `Levels for ${parkingLot.name}` : 'Parking Levels'}
            </h2>
          </div>
          <button
            onClick={openAddDialog}
            className="flex items-center px-4 py-2 bg-pink-400 text-white rounded-xl shadow hover:bg-pink-500 transition"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Level
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-800 p-3 mb-4 rounded-xl">{error}</div>}

        <table className="w-full table-auto bg-yellow-50 rounded-xl overflow-hidden text-sm shadow-sm">
          <thead className="bg-yellow-200 text-yellow-900">
            <tr>
              <th className="p-3 text-left">Level</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Capacity</th>
              <th className="p-3 text-left">Available</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parkingLevels.map((level) => (
              <tr key={level._id} className="hover:bg-yellow-100 transition">
                <td className="p-3">{level.level}</td>
                <td className="p-3">{level.name}</td>
                <td className="p-3">{level.capacity}</td>
                <td className="p-3">{level.availableSpaces}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${level.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {level.isOpen ? 'Open' : 'Closed'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleEditParkingLevel(level)} className="text-yellow-500 hover:text-yellow-700">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteParkingLevel(level._id || '')} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {parkingLevels.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No levels added yet 🥺 Add one above!
          </div>
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-96 space-y-4">
            <h3 className="text-lg font-bold text-pink-600">
              {editingId ? 'Edit Level' : 'Add a New Level'}
            </h3>

            <input type="number" placeholder="Level Number" value={newParkingLevel.level || ''} onChange={e => setNewParkingLevel({ ...newParkingLevel, level: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
            <input type="text" placeholder="Name" value={newParkingLevel.name || ''} onChange={e => setNewParkingLevel({ ...newParkingLevel, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            <input type="number" placeholder="Capacity" value={newParkingLevel.capacity || ''} onChange={e => setNewParkingLevel({ ...newParkingLevel, capacity: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
            <input type="number" placeholder="Available Spaces" value={newParkingLevel.availableSpaces || ''} onChange={e => setNewParkingLevel({ ...newParkingLevel, availableSpaces: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
            <div className="flex items-center">
              <input type="checkbox" id="isOpen" checked={newParkingLevel.isOpen || false} onChange={e => setNewParkingLevel({ ...newParkingLevel, isOpen: e.target.checked })} className="mr-2" />
              <label htmlFor="isOpen">Open for Parking</label>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => { setIsDialogOpen(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
              <button onClick={handleSaveParkingLevel} disabled={!newParkingLevel.level || !newParkingLevel.name || !newParkingLevel.capacity || newParkingLevel.availableSpaces === undefined} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
                {editingId ? 'Update' : 'Add'} Level
              </button>
            </div>
            {isDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-3xl shadow-2xl w-96 space-y-4">
                  <h3 className="text-lg font-bold text-pink-600">
                    {editingId ? 'Edit Level' : 'Add a New Level'}
                  </h3>

                  <input type="number" placeholder="Level Number" value={newParkingLevel.level || ''} onChange={e => setNewParkingLevel({ ...newParkingLevel, level: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                  <input type="text" placeholder="Name" value={newParkingLevel.name || ''} onChange={e => setNewParkingLevel({ ...newParkingLevel, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  <input type="number" placeholder="Capacity" value={newParkingLevel.capacity || ''} onChange={e => setNewParkingLevel({ ...newParkingLevel, capacity: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                  <input type="number" placeholder="Available Spaces" value={newParkingLevel.availableSpaces || ''} onChange={e => setNewParkingLevel({ ...newParkingLevel, availableSpaces: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                  <input type="number" placeholder="Spots to Generate" value={spotCount} onChange={e => setSpotCount(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
                  <div className="flex items-center">
                    <input type="checkbox" id="isOpen" checked={newParkingLevel.isOpen || false} onChange={e => setNewParkingLevel({ ...newParkingLevel, isOpen: e.target.checked })} className="mr-2" />
                    <label htmlFor="isOpen">Open for Parking</label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => { setIsDialogOpen(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSaveParkingLevel} disabled={!newParkingLevel.level || !newParkingLevel.name || !newParkingLevel.capacity || newParkingLevel.availableSpaces === undefined} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50">
                      {editingId ? 'Update' : 'Add'} Level
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
    