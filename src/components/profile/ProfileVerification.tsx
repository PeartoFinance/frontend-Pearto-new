'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Shield, CheckCircle2, X, Loader2 } from 'lucide-react';
import { UserProfile } from '@/services/userService';

interface VerificationStatus {
    emailVerified: boolean;
    emailVerifiedAt: string | null;
    phoneVerified: boolean;
    phoneVerifiedAt: string | null;
    idVerified: boolean;
    idVerifiedAt: string | null;
    verifiedBadge: boolean;
    hasPhone: boolean;
}

interface ProfileVerificationProps {
    profile: UserProfile;
}

export default function ProfileVerification({ profile }: ProfileVerificationProps) {
    const [status, setStatus] = useState<VerificationStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState<string | null>(null);

    // Email verification
    const [emailCode, setEmailCode] = useState('');
    const [emailStep, setEmailStep] = useState<'idle' | 'code-sent' | 'verifying'>('idle');
    const [demoEmailCode, setDemoEmailCode] = useState<string>('');

    // Phone verification
    const [phone, setPhone] = useState('');
    const [phoneCode, setPhoneCode] = useState('');
    const [phoneStep, setPhoneStep] = useState<'idle' | 'code-sent' | 'verifying'>('idle');
    const [demoPhoneCode, setDemoPhoneCode] = useState<string>('');

    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            // Mock status based on profile data for now
            // In real implementation, this would call /api/user/verification/status
            setStatus({
                emailVerified: profile.emailVerified || false,
                emailVerifiedAt: profile.emailVerified ? new Date().toISOString() : null,
                phoneVerified: profile.phoneVerified || false,
                phoneVerifiedAt: profile.phoneVerified ? new Date().toISOString() : null,
                idVerified: profile.idVerified || false,
                idVerifiedAt: profile.idVerified ? new Date().toISOString() : null,
                verifiedBadge: profile.verifiedBadge || false,
                hasPhone: !!profile.phone,
            });
        } catch (err) {
            console.error('Failed to fetch verification status:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailCode = async () => {
        setError('');
        setSuccess('');
        setVerifying('email');

        try {
            // Mock API call - replace with actual backend call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setEmailStep('code-sent');
            setDemoEmailCode('123456'); // Demo code
            setSuccess('Verification code sent to your email!');
        } catch (err) {
            setError('Failed to send verification code');
        } finally {
            setVerifying(null);
        }
    };

    const handleVerifyEmail = async () => {
        setError('');
        setEmailStep('verifying');

        try {
            // Mock verification - replace with actual backend call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (emailCode === demoEmailCode) {
                setSuccess('Email verified successfully!');
                setEmailStep('idle');
                setEmailCode('');
                await fetchStatus();
            } else {
                setError('Invalid code');
                setEmailStep('code-sent');
            }
        } catch (err) {
            setError('Verification failed');
            setEmailStep('code-sent');
        }
    };

    const handleSendPhoneCode = async () => {
        if (!phone) {
            setError('Please enter your phone number');
            return;
        }

        setError('');
        setSuccess('');
        setVerifying('phone');

        try {
            // Mock API call - replace with actual backend call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setPhoneStep('code-sent');
            setDemoPhoneCode('654321'); // Demo code
            setSuccess('Verification code sent to your phone!');
        } catch (err) {
            setError('Failed to send verification code');
        } finally {
            setVerifying(null);
        }
    };

    const handleVerifyPhone = async () => {
        setError('');
        setPhoneStep('verifying');

        try {
            // Mock verification - replace with actual backend call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (phoneCode === demoPhoneCode) {
                setSuccess('Phone verified successfully!');
                setPhoneStep('idle');
                setPhoneCode('');
                setPhone('');
                await fetchStatus();
            } else {
                setError('Invalid code');
                setPhoneStep('code-sent');
            }
        } catch (err) {
            setError('Verification failed');
            setPhoneStep('code-sent');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Identity Verification</h2>
                <p className="text-slate-400 mt-1">
                    Verify your identity to earn a trusted badge and unlock premium features.
                </p>
            </div>

            {/* Verified Badge Status */}
            {status?.verifiedBadge && (
                <div className="bg-linear-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <div>
                            <h3 className="font-semibold text-white">Verified User</h3>
                            <p className="text-sm text-slate-400">Your profile has been verified</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Messages */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <p className="text-sm text-emerald-400">{success}</p>
                </div>
            )}

            {/* Email Verification */}
            <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Mail className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Email Verification</h3>
                            <p className="text-sm text-slate-400">{profile.email}</p>
                        </div>
                    </div>
                    {status?.emailVerified && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                </div>

                {!status?.emailVerified ? (
                    emailStep === 'idle' ? (
                        <button
                            onClick={handleSendEmailCode}
                            disabled={verifying === 'email'}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white rounded-lg px-4 py-2.5 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {verifying === 'email' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Verification Code'
                            )}
                        </button>
                    ) : (
                        <div className="space-y-3">
                            {demoEmailCode && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-center">
                                    <p className="text-xs text-yellow-400 mb-1">Demo Code:</p>
                                    <p className="text-lg font-mono font-bold text-yellow-300">{demoEmailCode}</p>
                                </div>
                            )}
                            <input
                                type="text"
                                value={emailCode}
                                onChange={(e) => setEmailCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleVerifyEmail}
                                    disabled={emailStep === 'verifying' || emailCode.length !== 6}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
                                >
                                    {emailStep === 'verifying' ? 'Verifying...' : 'Verify'}
                                </button>
                                <button
                                    onClick={() => { setEmailStep('idle'); setEmailCode(''); }}
                                    className="px-4 py-2.5 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="text-sm text-emerald-400">
                        ✓ Verified {status.emailVerifiedAt && `on ${new Date(status.emailVerifiedAt).toLocaleDateString()}`}
                    </div>
                )}
            </div>

            {/* Phone Verification */}
            <div className="bg-[#111314] border border-slate-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <Phone className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Phone Verification</h3>
                            <p className="text-sm text-slate-400">Verify your phone number</p>
                        </div>
                    </div>
                    {status?.phoneVerified && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                </div>

                {!status?.phoneVerified ? (
                    phoneStep === 'idle' ? (
                        <div className="space-y-3">
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <button
                                onClick={handleSendPhoneCode}
                                disabled={verifying === 'phone' || !phone}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white rounded-lg px-4 py-2.5 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {verifying === 'phone' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {demoPhoneCode && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-center">
                                    <p className="text-xs text-yellow-400 mb-1">Demo Code:</p>
                                    <p className="text-lg font-mono font-bold text-yellow-300">{demoPhoneCode}</p>
                                </div>
                            )}
                            <input
                                type="text"
                                value={phoneCode}
                                onChange={(e) => setPhoneCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleVerifyPhone}
                                    disabled={phoneStep === 'verifying' || phoneCode.length !== 6}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
                                >
                                    {phoneStep === 'verifying' ? 'Verifying...' : 'Verify'}
                                </button>
                                <button
                                    onClick={() => { setPhoneStep('idle'); setPhoneCode(''); }}
                                    className="px-4 py-2.5 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="text-sm text-emerald-400">
                        ✓ Verified {status.phoneVerifiedAt && `on ${new Date(status.phoneVerifiedAt).toLocaleDateString()}`}
                    </div>
                )}
            </div>

            {/* ID Verification (Coming Soon) */}
            <div className="bg-[#111314] border border-slate-800 rounded-lg p-6 opacity-60">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">ID Verification</h3>
                            <p className="text-sm text-slate-400">Coming soon</p>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-slate-500">
                    Government-issued ID verification will be available soon for enhanced trust.
                </p>
            </div>
        </div>
    );
}