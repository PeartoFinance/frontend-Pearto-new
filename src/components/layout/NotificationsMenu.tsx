'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { get } from '@/services/api';

// Types for Alerts (mirroring backend UserAlert)
interface UserAlert {
    id: string;
    symbol: string;
    alertType: string;
    condition: string;
    targetValue: number;
    isActive: boolean;
    isTriggered: boolean;
    triggeredAt: string | null;
    createdAt: string;
}

export default function NotificationsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [alerts, setAlerts] = useState<UserAlert[]>([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fetch alerts
    const fetchAlerts = async () => {
        try {
            setLoading(true);
            // Verify endpoint in userService exists or use direct api call
            const data = await get<UserAlert[]>('/user/alerts');

            // Filter/Sort: prioritizing triggered alerts or recent ones
            // For now, let's just show all, but visually distinguish triggered ones
            const sortedAndFiltered = data.sort((a, b) => {
                // Triggered first, then new
                if (a.isTriggered && !b.isTriggered) return -1;
                if (!a.isTriggered && b.isTriggered) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setAlerts(sortedAndFiltered);

            // Calculate "unread" as triggered alerts for now
            const triggeredCount = sortedAndFiltered.filter(a => a.isTriggered).length;
            setUnreadCount(triggeredCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load and polling
    useEffect(() => {
        fetchAlerts();
        // Poll every 60 seconds
        const interval = setInterval(fetchAlerts, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);


    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-slate-600 dark:text-white" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-[60] overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => setUnreadCount(0)} // Client-side clear for now
                                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {loading && alerts.length === 0 ? (
                            <div className="flex justify-center p-8">
                                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
                                <Bell className="w-12 h-12 mb-3 opacity-20" />
                                <p>No notifications yet</p>
                                <p className="text-sm mt-1">We'll let you know when something important happens.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${alert.isTriggered ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 p-2 rounded-full shrink-0 ${alert.isTriggered
                                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {alert.isTriggered ? <Check size={16} /> : <TrendingUp size={16} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                        {alert.symbol} Price Alert
                                                    </p>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                        {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleDateString() : new Date(alert.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {alert.isTriggered
                                                        ? `${alert.symbol} has reached your target of ${alert.targetValue}`
                                                        : `You have an active alert for ${alert.symbol} ${alert.condition} ${alert.targetValue}`
                                                    }
                                                </p>
                                            </div>
                                            {alert.isTriggered && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-900/50">
                        <Link
                            href="/profile"
                            className="block w-full py-2 text-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                            onClick={() => setIsOpen(false)}
                        >
                            View All Settings
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
