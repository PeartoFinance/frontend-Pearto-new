'use client';

import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, AlertTriangle, TrendingUp, TrendingDown, Pause, Play, X } from 'lucide-react';
import { getAlerts, createAlert, deleteAlert, toggleAlert, type Alert, type CreateAlertData } from '@/services/alertsService';
import StockSymbolInput from '@/components/common/StockSymbolInput';

export default function ProfileAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAlert, setNewAlert] = useState<CreateAlertData>({
        symbol: '',
        condition: 'above',
        targetValue: 0,
        notifyEmail: true,
        notifyPush: true,
    });

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            const data = await getAlerts();
            setAlerts(data);
        } catch (error) {
            console.error('Failed to load alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAlert = async () => {
        if (!newAlert.symbol || !newAlert.targetValue) return;

        try {
            await createAlert(newAlert);
            setShowAddModal(false);
            setNewAlert({ symbol: '', condition: 'above', targetValue: 0, notifyEmail: true, notifyPush: true });
            await loadAlerts();
        } catch (error) {
            console.error('Failed to create alert:', error);
        }
    };

    const handleDeleteAlert = async (alertId: string) => {
        try {
            await deleteAlert(alertId);
            await loadAlerts();
        } catch (error) {
            console.error('Failed to delete alert:', error);
        }
    };

    const handleToggleAlert = async (alertId: string) => {
        try {
            await toggleAlert(alertId);
            await loadAlerts();
        } catch (error) {
            console.error('Failed to toggle alert:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Price Alerts</h2>
                    <p className="text-slate-400 mt-1">Get notified when prices hit your targets</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg transition"
                >
                    <Plus size={18} />
                    Create Alert
                </button>
            </div>

            {alerts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No alerts yet</h3>
                    <p className="text-slate-400 mb-4">Create price alerts to get notified</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            onToggle={() => handleToggleAlert(alert.id)}
                            onDelete={() => handleDeleteAlert(alert.id)}
                        />
                    ))}
                </div>
            )}

            {/* Add Alert Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create Price Alert</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Symbol</label>
                                <StockSymbolInput
                                    value={newAlert.symbol}
                                    onChange={(sym) => setNewAlert({ ...newAlert, symbol: sym.toUpperCase() })}
                                    placeholder="e.g., AAPL"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condition</label>
                                    <select
                                        value={newAlert.condition}
                                        onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as 'above' | 'below' })}
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                                    >
                                        <option value="above">Price Above</option>
                                        <option value="below">Price Below</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Price</label>
                                    <input
                                        type="number"
                                        value={newAlert.targetValue || ''}
                                        onChange={(e) => setNewAlert({ ...newAlert, targetValue: parseFloat(e.target.value) })}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={newAlert.notifyEmail}
                                        onChange={(e) => setNewAlert({ ...newAlert, notifyEmail: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    Email
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={newAlert.notifyPush}
                                        onChange={(e) => setNewAlert({ ...newAlert, notifyPush: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    Push
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t border-slate-700">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">
                                Cancel
                            </button>
                            <button onClick={handleCreateAlert} className="px-4 py-2 bg-emerald-500 text-black font-medium rounded-lg">
                                Create Alert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AlertCard({ alert, onToggle, onDelete }: { alert: Alert; onToggle: () => void; onDelete: () => void }) {
    const isAbove = alert.condition === 'above';

    return (
        <div className={`p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg ${!alert.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isAbove ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {isAbove ? <TrendingUp className="text-emerald-500" size={20} /> : <TrendingDown className="text-red-500" size={20} />}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white">{alert.symbol}</div>
                        <div className="text-sm text-slate-400">
                            {isAbove ? 'Price above' : 'Price below'} ${alert.targetValue?.toFixed(2)}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {alert.isTriggered && (
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded font-medium">
                            Triggered
                        </span>
                    )}
                    <button onClick={onToggle} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                        {alert.isActive ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-400 transition">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
