'use client';

import { useState, useEffect } from 'react';
import { Save, Mail, Bell, MessageSquare, Moon, Shield, TrendingUp, Newspaper, Calendar, Send, Clock } from 'lucide-react';
import { getNotificationPreferences, updateNotificationPreferences, type NotificationPreferences } from '@/services/userService';

interface NotificationToggleProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    badge?: string;
}

function NotificationToggle({ label, description, checked, onChange, icon, disabled, badge }: NotificationToggleProps) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-lg border transition ${disabled
                ? 'bg-slate-800/30 border-slate-700/50 opacity-60'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}>
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                        {icon}
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">{label}</span>
                        {badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                </div>
            </div>
            <button
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-600'
                    } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'
                    }`} />
            </button>
        </div>
    );
}

export default function ProfileNotifications() {
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        emailSecurity: true,
        emailAccount: true,
        emailPriceAlerts: true,
        emailDailyDigest: true,
        emailEarnings: true,
        emailNews: true,
        emailMarketing: false,
        emailNewsletter: true,
        pushSecurity: true,
        pushPriceAlerts: true,
        pushNews: true,
        pushEarnings: true,
        smsSecurity: false,
        smsPriceAlerts: false,
        quietHoursEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const data = await getNotificationPreferences();
            setPreferences(data);
        } catch (error) {
            console.error('Failed to load notification preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: keyof NotificationPreferences, value: boolean | string) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
        setMessage(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const result = await updateNotificationPreferences(preferences);
            setPreferences(result.preferences);
            setMessage({ type: 'success', text: 'Notification preferences saved!' });
            setHasChanges(false);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to save preferences'
            });
        } finally {
            setSaving(false);
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
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Notifications</h2>
                <p className="text-slate-400 mt-1">
                    Choose how and when you want to be notified about account activity, market updates, and more.
                </p>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Email Notifications */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Mail className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Email Notifications</h3>
                        <p className="text-sm text-slate-400">Manage what emails you receive</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <NotificationToggle
                        label="Security Alerts"
                        description="Login notifications, password changes, new device alerts"
                        checked={preferences.emailSecurity}
                        onChange={(v) => handleChange('emailSecurity', v)}
                        icon={<Shield size={16} className="text-red-400" />}
                    />
                    <NotificationToggle
                        label="Account Updates"
                        description="Profile changes, verification status, important updates"
                        checked={preferences.emailAccount}
                        onChange={(v) => handleChange('emailAccount', v)}
                        icon={<Bell size={16} className="text-blue-400" />}
                    />
                    <NotificationToggle
                        label="Price Alerts"
                        description="Notifications when your watchlist stocks hit target prices"
                        checked={preferences.emailPriceAlerts}
                        onChange={(v) => handleChange('emailPriceAlerts', v)}
                        icon={<TrendingUp size={16} className="text-emerald-400" />}
                    />
                    <NotificationToggle
                        label="Daily Market Digest"
                        description="Daily summary of your portfolio and watchlist performance"
                        checked={preferences.emailDailyDigest}
                        onChange={(v) => handleChange('emailDailyDigest', v)}
                        icon={<Calendar size={16} className="text-purple-400" />}
                    />
                    <NotificationToggle
                        label="Earnings Reminders"
                        description="Alerts before earnings announcements for your watchlist"
                        checked={preferences.emailEarnings}
                        onChange={(v) => handleChange('emailEarnings', v)}
                        icon={<Calendar size={16} className="text-amber-400" />}
                    />
                    <NotificationToggle
                        label="Market News"
                        description="Breaking news and analysis for stocks you follow"
                        checked={preferences.emailNews}
                        onChange={(v) => handleChange('emailNews', v)}
                        icon={<Newspaper size={16} className="text-cyan-400" />}
                    />
                    <NotificationToggle
                        label="Weekly Newsletter"
                        description="Weekly market insights and educational content"
                        checked={preferences.emailNewsletter}
                        onChange={(v) => handleChange('emailNewsletter', v)}
                        icon={<Send size={16} className="text-indigo-400" />}
                    />
                    <NotificationToggle
                        label="Marketing & Promotions"
                        description="Special offers, new features, and promotional content"
                        checked={preferences.emailMarketing}
                        onChange={(v) => handleChange('emailMarketing', v)}
                        icon={<Send size={16} className="text-pink-400" />}
                    />
                </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Bell className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Push Notifications</h3>
                        <p className="text-sm text-slate-400">Browser and mobile push alerts</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <NotificationToggle
                        label="Security Alerts"
                        description="Instant alerts for security-related events"
                        checked={preferences.pushSecurity}
                        onChange={(v) => handleChange('pushSecurity', v)}
                        icon={<Shield size={16} className="text-red-400" />}
                    />
                    <NotificationToggle
                        label="Price Alerts"
                        description="Real-time notifications when prices hit targets"
                        checked={preferences.pushPriceAlerts}
                        onChange={(v) => handleChange('pushPriceAlerts', v)}
                        icon={<TrendingUp size={16} className="text-emerald-400" />}
                    />
                    <NotificationToggle
                        label="Market News"
                        description="Breaking market news and updates"
                        checked={preferences.pushNews}
                        onChange={(v) => handleChange('pushNews', v)}
                        icon={<Newspaper size={16} className="text-cyan-400" />}
                    />
                    <NotificationToggle
                        label="Earnings Reminders"
                        description="Push alerts before earnings announcements"
                        checked={preferences.pushEarnings}
                        onChange={(v) => handleChange('pushEarnings', v)}
                        icon={<Calendar size={16} className="text-amber-400" />}
                    />
                </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">SMS Notifications</h3>
                        <p className="text-sm text-slate-400">Text message alerts for critical updates</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <NotificationToggle
                        label="Security Alerts"
                        description="SMS alerts for account security events"
                        checked={preferences.smsSecurity}
                        onChange={(v) => handleChange('smsSecurity', v)}
                        icon={<Shield size={16} className="text-red-400" />}
                        badge="Premium"
                    />
                    <NotificationToggle
                        label="Price Alerts"
                        description="SMS when your stocks hit important price levels"
                        checked={preferences.smsPriceAlerts}
                        onChange={(v) => handleChange('smsPriceAlerts', v)}
                        icon={<TrendingUp size={16} className="text-emerald-400" />}
                        badge="Premium"
                    />
                </div>
            </div>

            {/* Quiet Hours */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Moon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Quiet Hours</h3>
                        <p className="text-sm text-slate-400">Pause non-critical notifications during specific hours</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <NotificationToggle
                        label="Enable Quiet Hours"
                        description="Only security alerts will be sent during quiet hours"
                        checked={preferences.quietHoursEnabled}
                        onChange={(v) => handleChange('quietHoursEnabled', v)}
                        icon={<Clock size={16} className="text-amber-400" />}
                    />

                    {preferences.quietHoursEnabled && (
                        <div className="flex items-center gap-4 ml-12">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={preferences.quietHoursStart || '22:00'}
                                    onChange={(e) => handleChange('quietHoursStart', e.target.value)}
                                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <span className="text-slate-500 pt-5">to</span>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={preferences.quietHoursEnd || '08:00'}
                                    onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
                                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-medium rounded-lg transition flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Preferences
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
