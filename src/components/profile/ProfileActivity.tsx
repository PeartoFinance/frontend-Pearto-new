'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock, Shield, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { getActivity, getLoginHistory, getActivitySummary, type Activity as ActivityType, type LoginEvent, type ActivitySummary } from '@/services/activityService';

export default function ProfileActivity() {
    const [activities, setActivities] = useState<ActivityType[]>([]);
    const [logins, setLogins] = useState<LoginEvent[]>([]);
    const [summary, setSummary] = useState<ActivitySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'activity' | 'logins'>('activity');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [activityData, loginData, summaryData] = await Promise.all([
                getActivity(30),
                getLoginHistory(20),
                getActivitySummary()
            ]);
            setActivities(activityData);
            setLogins(loginData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to load activity:', error);
        } finally {
            setLoading(false);
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
            <div>
                <h2 className="text-2xl font-bold text-white">Activity & Security</h2>
                <p className="text-slate-400 mt-1">Track your account activity and login history</p>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard icon={Activity} label="Total Activities" value={summary.totalActivities} />
                    <SummaryCard icon={Clock} label="This Week" value={summary.recentActivities} color="blue" />
                    <SummaryCard icon={CheckCircle} label="Logins" value={summary.recentLogins} color="green" />
                    <SummaryCard icon={XCircle} label="Failed" value={summary.failedLogins} color="red" />
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'activity'
                            ? 'bg-emerald-500 text-black'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    Activity Log
                </button>
                <button
                    onClick={() => setActiveTab('logins')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'logins'
                            ? 'bg-emerald-500 text-black'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                >
                    Login History
                </button>
            </div>

            {/* Activity Log */}
            {activeTab === 'activity' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {activities.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No activity recorded yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {activities.map((activity) => (
                                <ActivityRow key={activity.id} activity={activity} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Login History */}
            {activeTab === 'logins' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {logins.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No login history</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {logins.map((login) => (
                                <LoginRow key={login.id} login={login} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SummaryCard({ icon: Icon, label, value, color = 'slate' }: {
    icon: any;
    label: string;
    value: number;
    color?: 'slate' | 'blue' | 'green' | 'red'
}) {
    const colors = {
        slate: 'bg-slate-700 text-slate-300',
        blue: 'bg-blue-500/10 text-blue-400',
        green: 'bg-emerald-500/10 text-emerald-400',
        red: 'bg-red-500/10 text-red-400',
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
                <Icon size={20} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
        </div>
    );
}

function ActivityRow({ activity }: { activity: ActivityType }) {
    const getActionIcon = () => {
        switch (activity.action) {
            case 'page_view': return <Activity size={16} />;
            case 'login': return <Shield size={16} />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700 rounded-lg text-slate-400">
                    {getActionIcon()}
                </div>
                <div>
                    <div className="font-medium text-white capitalize">
                        {activity.action.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-slate-400">
                        {activity.entityType}: {activity.entityId}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs text-slate-500">{activity.ipAddress}</div>
                <div className="text-xs text-slate-400">
                    {new Date(activity.createdAt).toLocaleString()}
                </div>
            </div>
        </div>
    );
}

function LoginRow({ login }: { login: LoginEvent }) {
    return (
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${login.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {login.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </div>
                <div>
                    <div className="font-medium text-white">
                        {login.success ? 'Successful Login' : 'Failed Login'}
                    </div>
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                        <MapPin size={12} />
                        {login.location || 'Unknown Location'}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs text-slate-500">{login.ipAddress}</div>
                <div className="text-xs text-slate-400">
                    {new Date(login.createdAt).toLocaleString()}
                </div>
            </div>
        </div>
    );
}
