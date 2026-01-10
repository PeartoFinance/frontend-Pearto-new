'use client';

import { useState, useEffect } from 'react';
import { Save, X, Upload, User, Mail, Phone, Globe, Camera } from 'lucide-react';
import { UserProfile, updateProfile } from '@/services/userService';

interface ProfileSettingsProps {
    profile: UserProfile;
    onClose: () => void;
    onUpdate: (updatedProfile: UserProfile) => void;
}

export default function ProfileSettings({ profile, onClose, onUpdate }: ProfileSettingsProps) {
    const [formData, setFormData] = useState({
        name: profile.name || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setMessage(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await updateProfile(formData);
            onUpdate(response.user);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => onClose(), 1500);
        } catch (error: any) {
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to update profile' 
            });
        } finally {
            setSaving(false);
        }
    };

    const isChanged = formData.name !== profile.name || 
                     formData.phone !== profile.phone || 
                     formData.avatarUrl !== profile.avatarUrl;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111314] border border-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Avatar Section */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-3">Profile Picture</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/80 to-cyan-500/70 text-white flex items-center justify-center text-xl font-bold overflow-hidden">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{formData.name.charAt(0).toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition">
                                    <Camera size={16} />
                                    Upload Photo
                                </div>
                            </label>
                            {formData.avatarUrl && (
                                <button
                                    onClick={() => handleInputChange('avatarUrl', '')}
                                    className="px-3 py-2 border border-slate-700 hover:border-slate-600 rounded-lg text-sm text-slate-400 hover:text-slate-300 transition"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 mb-6">
                    <Field
                        label="Display Name"
                        icon={User}
                        value={formData.name}
                        onChange={(value) => handleInputChange('name', value)}
                        placeholder="Enter your name"
                        required
                    />

                    <Field
                        label="Email"
                        icon={Mail}
                        value={profile.email}
                        onChange={() => {}}
                        disabled
                        placeholder="Email cannot be changed"
                    />

                    <Field
                        label="Phone Number"
                        icon={Phone}
                        value={formData.phone}
                        onChange={(value) => handleInputChange('phone', value)}
                        placeholder="Enter your phone number"
                        type="tel"
                    />

                    <Field
                        label="Avatar URL (optional)"
                        icon={Globe}
                        value={formData.avatarUrl}
                        onChange={(value) => handleInputChange('avatarUrl', value)}
                        placeholder="https://example.com/avatar.jpg"
                        type="url"
                    />
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                        message.type === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-300 hover:text-white transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !isChanged || !formData.name.trim()}
                        className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-medium rounded-lg transition flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ 
    label, 
    icon: Icon, 
    value, 
    onChange, 
    placeholder, 
    type = 'text', 
    disabled = false, 
    required = false 
}: {
    label: string;
    icon: React.FC<{ className?: string }>;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                    <Icon size={16} />
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );
}