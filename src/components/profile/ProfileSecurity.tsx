'use client';

import { useState } from 'react';
import { Save, Eye, EyeOff, Shield, Lock, Key, AlertTriangle } from 'lucide-react';
import { changePassword } from '@/services/userService';

interface ProfileSecurityProps {
    onPasswordChange?: () => void;
}

export default function ProfileSecurity({ onPasswordChange }: ProfileSecurityProps) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setMessage(null);
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validatePassword = (password: string) => {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?\":{}|<>]/.test(password);

        return {
            minLength,
            hasUpper,
            hasLower,
            hasNumber,
            hasSpecial,
            isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
        };
    };

    const passwordValidation = validatePassword(formData.newPassword);
    const passwordsMatch = formData.newPassword === formData.confirmPassword;

    const handleSave = async () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (!passwordValidation.isValid) {
            setMessage({ type: 'error', text: 'New password does not meet requirements' });
            return;
        }

        if (!passwordsMatch) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const response = await changePassword(formData.currentPassword, formData.newPassword);
            setMessage({ type: 'success', text: response.message || 'Password changed successfully!' });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            onPasswordChange?.();
        } catch (error: any) {
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to change password' 
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Security Settings</h2>
                <p className="text-slate-400 mt-1">
                    Manage your password and security preferences.
                </p>
            </div>

            {/* Change Password */}
            <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Lock className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Change Password</h3>
                        <p className="text-sm text-slate-400">Update your account password</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                placeholder="Enter your current password"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                placeholder="Enter your new password"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        
                        {/* Password Requirements */}
                        {formData.newPassword && (
                            <div className="mt-3 space-y-2">
                                <p className="text-xs text-slate-400">Password requirements:</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <RequirementItem 
                                        met={passwordValidation.minLength} 
                                        text="At least 8 characters" 
                                    />
                                    <RequirementItem 
                                        met={passwordValidation.hasUpper} 
                                        text="Uppercase letter" 
                                    />
                                    <RequirementItem 
                                        met={passwordValidation.hasLower} 
                                        text="Lowercase letter" 
                                    />
                                    <RequirementItem 
                                        met={passwordValidation.hasNumber} 
                                        text="Number" 
                                    />
                                    <RequirementItem 
                                        met={passwordValidation.hasSpecial} 
                                        text="Special character" 
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                placeholder="Confirm your new password"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {formData.confirmPassword && !passwordsMatch && (
                            <p className="mt-2 text-xs text-red-400">Passwords do not match</p>
                        )}
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${
                        message.type === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving || !passwordValidation.isValid || !passwordsMatch || !formData.currentPassword}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-medium rounded-lg transition flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                Changing...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Change Password
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Security Recommendations */}
            <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Shield className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Security Recommendations</h3>
                        <p className="text-sm text-slate-400">Keep your account secure</p>
                    </div>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <Key className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <div>
                            <p className="text-white font-medium">Use a strong, unique password</p>
                            <p className="text-slate-400">Avoid using the same password across multiple sites</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <div>
                            <p className="text-white font-medium">Enable two-factor authentication</p>
                            <p className="text-slate-400">Add an extra layer of security to your account</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                        <Shield className="w-4 h-4 text-cyan-500 mt-0.5" />
                        <div>
                            <p className="text-white font-medium">Keep your email secure</p>
                            <p className="text-slate-400">Ensure your email account is also protected</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <div className={`flex items-center gap-2 ${met ? 'text-emerald-400' : 'text-slate-500'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            <span>{text}</span>
        </div>
    );
}