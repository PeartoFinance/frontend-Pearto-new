'use client';

import { useState, useEffect } from 'react';
import {
    Bell,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    X,
    Check
} from 'lucide-react';
import {
    getAlerts,
    createAlert,
    deleteAlert,
    toggleAlert,
    type Alert
} from '@/services/alertsService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { UsageLimitBanner, UpgradeModal } from '@/components/subscription/FeatureGating';

interface ChartAlertPanelProps {
    symbol: string;
    currentPrice: number;
    onCreateAlertAtPrice?: (price: number) => void;
    className?: string;
}

export default function ChartAlertPanel({
    symbol,
    currentPrice,
    onCreateAlertAtPrice,
    className = ''
}: ChartAlertPanelProps) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [newAlert, setNewAlert] = useState({
        condition: 'above' as 'above' | 'below',
        targetValue: currentPrice,
        notifyEmail: true,
        notifyPush: true
    });
    const { currency, formatPrice } = useCurrency();
    const { trackUsage, isPro } = useSubscription();

    // Fetch alerts for this symbol
    useEffect(() => {
        async function loadAlerts() {
            try {
                const allAlerts = await getAlerts();
                const symbolAlerts = allAlerts.filter(a => a.symbol?.toUpperCase() === symbol.toUpperCase());
                setAlerts(symbolAlerts);
            } catch (error) {
                console.error('Failed to load alerts:', error);
            } finally {
                setLoading(false);
            }
        }
        loadAlerts();
    }, [symbol]);

    // Update target when current price changes
    useEffect(() => {
        if (!isCreating) {
            setNewAlert(prev => ({ ...prev, targetValue: currentPrice }));
        }
    }, [currentPrice, isCreating]);

    const handleCreateAlert = async () => {
        // Check usage limit for free users
        if (!isPro) {
            const { allowed } = await trackUsage('alerts_limit');
            if (!allowed) {
                setShowUpgradeModal(true);
                return;
            }
        }

        try {
            const response = await createAlert({
                symbol: symbol.toUpperCase(),
                condition: newAlert.condition,
                targetValue: newAlert.targetValue,
                notifyEmail: newAlert.notifyEmail,
                notifyPush: newAlert.notifyPush
            });
            // Construct a proper Alert object from the response + local data
            const newAlertObj: Alert = {
                id: response.id,
                symbol: symbol.toUpperCase(),
                alertType: 'price',
                condition: newAlert.condition,
                targetValue: newAlert.targetValue,
                isActive: true,
                isTriggered: false,
                triggeredAt: null,
                notifyEmail: newAlert.notifyEmail,
                notifyPush: newAlert.notifyPush,
                createdAt: new Date().toISOString()
            };
            setAlerts(prev => [...prev, newAlertObj]);
            setIsCreating(false);
            setNewAlert({
                condition: 'above',
                targetValue: currentPrice,
                notifyEmail: true,
                notifyPush: true
            });
        } catch (error) {
            console.error('Failed to create alert:', error);
        }
    };

    const handleDeleteAlert = async (alertId: string) => {
        try {
            await deleteAlert(alertId);
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (error) {
            console.error('Failed to delete alert:', error);
        }
    };

    const handleToggleAlert = async (alertId: string) => {
        try {
            const response = await toggleAlert(alertId);
            // Update only the isActive field from the response
            setAlerts(prev => prev.map(a =>
                a.id === alertId ? { ...a, isActive: response.isActive } : a
            ));
        } catch (error) {
            console.error('Failed to toggle alert:', error);
        }
    };



    return (
        <>
            <div className={`bg-slate-900 border border-slate-700 rounded-xl overflow-hidden ${className}`}>
                {/* Header */}
                <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell size={16} className="text-blue-400" />
                        <span className="font-medium text-white">Price Alerts</span>
                        {alerts.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                {alerts.length}
                            </span>
                        )}
                    </div>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition"
                        >
                            <Plus size={12} />
                            New Alert
                        </button>
                    )}
                </div>

                {/* Create Alert Form */}
                {isCreating && (
                    <div className="p-3 bg-slate-800/50 border-b border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-slate-400">Alert when price is</span>
                            <select
                                value={newAlert.condition}
                                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as 'above' | 'below' })}
                                className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                            >
                                <option value="above">Above</option>
                                <option value="below">Below</option>
                            </select>
                            <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">{currency === 'USD' ? '$' : currency}</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newAlert.targetValue}
                                    onChange={(e) => setNewAlert({ ...newAlert, targetValue: parseFloat(e.target.value) || 0 })}
                                    className="w-full pl-6 pr-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                                />
                            </div>
                        </div>

                        {/* Notification options */}
                        <div className="flex items-center gap-4 mb-3">
                            <label className="flex items-center gap-2 text-xs text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={newAlert.notifyEmail}
                                    onChange={(e) => setNewAlert({ ...newAlert, notifyEmail: e.target.checked })}
                                    className="rounded border-slate-600"
                                />
                                Email
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={newAlert.notifyPush}
                                    onChange={(e) => setNewAlert({ ...newAlert, notifyPush: e.target.checked })}
                                    className="rounded border-slate-600"
                                />
                                Push
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 px-3 py-1.5 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateAlert}
                                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1"
                            >
                                <Bell size={14} />
                                Create
                            </button>
                        </div>
                    </div>
                )}

                {/* Alert List */}
                <div className="max-h-48 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-slate-500">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">
                            <AlertTriangle size={24} className="mx-auto mb-2 opacity-50" />
                            No alerts for {symbol}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {alerts.map(alert => (
                                <div
                                    key={alert.id}
                                    className={`p-3 flex items-center gap-3 ${alert.isTriggered ? 'bg-yellow-500/10' : ''}`}
                                >
                                    <div className={`p-1.5 rounded ${alert.condition === 'above'
                                        ? 'bg-green-500/20'
                                        : 'bg-red-500/20'}`}>
                                        {alert.condition === 'above'
                                            ? <TrendingUp size={14} className="text-green-400" />
                                            : <TrendingDown size={14} className="text-red-400" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">
                                                {formatPrice(alert.targetValue)}
                                            </span>
                                            <span className="text-xs text-slate-500 capitalize">
                                                ({alert.condition})
                                            </span>
                                            {alert.isTriggered && (
                                                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                                    Triggered
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {alert.notifyEmail && 'Email'} {alert.notifyPush && 'Push'}
                                        </div>
                                    </div>

                                    {/* Toggle */}
                                    <button
                                        onClick={() => handleToggleAlert(alert.id)}
                                        className="p-1 hover:bg-slate-700 rounded transition"
                                        title={alert.isActive ? 'Disable' : 'Enable'}
                                    >
                                        {alert.isActive
                                            ? <ToggleRight size={20} className="text-green-400" />
                                            : <ToggleLeft size={20} className="text-slate-500" />}
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDeleteAlert(alert.id)}
                                        className="p-1 hover:bg-red-500/20 rounded transition"
                                    >
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Alert from Chart Tip */}
                {onCreateAlertAtPrice && (
                    <div className="p-2 border-t border-slate-700 bg-slate-800/30">
                        <p className="text-xs text-slate-500 text-center">
                            Right-click on chart to set alert at price level
                        </p>
                    </div>
                )}

                {/* Usage limit banner for free users */}
                {!isPro && (
                    <div className="p-2 border-t border-slate-700">
                        <UsageLimitBanner
                            featureKey="alerts_limit"
                            featureLabel="Price Alerts"
                            compact
                        />
                    </div>
                )}
            </div>

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                featureKey="alerts_limit"
                message="You've reached your limit for price alerts. Upgrade to Pro for unlimited alerts."
            />
        </>
    );
}
