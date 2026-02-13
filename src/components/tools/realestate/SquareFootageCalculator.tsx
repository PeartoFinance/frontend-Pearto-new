'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Home, Ruler, DollarSign, Calculator } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function SquareFootageCalculator() {
    const { formatPrice } = useCurrency();
    const [rooms, setRooms] = useState([
        { name: 'Living Room', length: 20, width: 15 },
        { name: 'Bedroom 1', length: 12, width: 12 },
        { name: 'Bedroom 2', length: 10, width: 10 },
        { name: 'Kitchen', length: 12, width: 10 },
        { name: 'Bathroom', length: 8, width: 6 },
    ]);
    const [pricePerSqFt, setPricePerSqFt] = useState(150);

    const results = useMemo(() => {
        const roomData = rooms.map(room => ({
            ...room,
            area: room.length * room.width
        }));

        const totalSqFt = roomData.reduce((sum, room) => sum + room.area, 0);
        const totalValue = totalSqFt * pricePerSqFt;

        return {
            rooms: roomData,
            totalSqFt,
            totalValue,
            avgRoomSize: rooms.length > 0 ? totalSqFt / rooms.length : 0
        };
    }, [rooms, pricePerSqFt]);

    const updateRoom = (index: number, field: string, value: string | number) => {
        const updated = [...rooms];
        updated[index] = { ...updated[index], [field]: value };
        setRooms(updated);
    };

    const addRoom = () => {
        setRooms([...rooms, { name: `Room ${rooms.length + 1}`, length: 10, width: 10 }]);
    };

    const removeRoom = (index: number) => {
        setRooms(rooms.filter((_, i) => i !== index));
    };

    const formatNumber = (value: number) => value.toLocaleString();

    return (
        <CalculatorLayout
            title="Square Footage Calculator"
            description="Calculate total square footage and property value"
            category="Real Estate"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <Ruler className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Total Area</p>
                        <p className="text-4xl font-bold text-emerald-600">
                            {formatNumber(results.totalSqFt)} <span className="text-lg">sq ft</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Estimated Value</p>
                            <p className="text-xl font-bold text-blue-600">
                                {formatPrice(results.totalValue)}
                            </p>
                            <p className="text-xs text-slate-400">@ {formatPrice(pricePerSqFt)}/sq ft</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Avg Room Size</p>
                            <p className="text-xl font-bold text-purple-600">
                                {results.avgRoomSize.toFixed(0)} sq ft
                            </p>
                        </div>
                    </div>

                    {/* Room Breakdown */}
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Room Breakdown
                        </p>
                        <div className="space-y-2">
                            {results.rooms.map((room, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{room.name}</span>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {formatNumber(room.area)} sq ft
                                        </span>
                                        <span className="text-xs text-slate-400 ml-2">
                                            {room.length}×{room.width}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual breakdown */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-3">Area Distribution</p>
                        <div className="flex rounded-lg overflow-hidden h-6">
                            {results.rooms.map((room, i) => {
                                const percent = results.totalSqFt > 0 ? (room.area / results.totalSqFt) * 100 : 0;
                                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500'];
                                return (
                                    <div
                                        key={i}
                                        className={`${colors[i % colors.length]} h-full`}
                                        style={{ width: `${percent}%` }}
                                        title={`${room.name}: ${room.area} sq ft`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Rooms */}
                <div className="space-y-3">
                    {rooms.map((room, index) => (
                        <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex gap-2 items-center mb-2">
                                <input
                                    type="text"
                                    value={room.name}
                                    onChange={(e) => updateRoom(index, 'name', e.target.value)}
                                    className="flex-1 px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                                <button
                                    onClick={() => removeRoom(index)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500">Length (ft)</label>
                                    <input
                                        type="number"
                                        value={room.length}
                                        onChange={(e) => updateRoom(index, 'length', Number(e.target.value))}
                                        className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500">Width (ft)</label>
                                    <input
                                        type="number"
                                        value={room.width}
                                        onChange={(e) => updateRoom(index, 'width', Number(e.target.value))}
                                        className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addRoom}
                    className="w-full py-2 text-sm text-emerald-600 border border-dashed border-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
                >
                    + Add Room
                </button>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Price per Sq Ft ($)
                    </label>
                    <input
                        type="number"
                        value={pricePerSqFt}
                        onChange={(e) => setPricePerSqFt(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>
            </div>
        </CalculatorLayout>
    );
}
