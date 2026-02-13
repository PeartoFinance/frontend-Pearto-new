'use client';

import { useState } from 'react';
import {
    CheckCircle2, GraduationCap, Info, Mail, Phone, Calendar as CalendarIcon,
    FileText, ChevronLeft, ChevronRight, Save, Bold, Italic, List,
    Edit2, Plus, X
} from 'lucide-react';
import { ProfileData, Specialization, Certification, updateProfile, UserProfile } from '@/services/userService';
import PriceDisplay from '@/components/common/PriceDisplay';
import Calendar from '@/app/profile/Calendar';

interface ProfileOverviewProps {
    profileData: ProfileData;
    onUpdate: (updatedProfile: UserProfile) => void;
    onUpdateData: (data: Partial<ProfileData>) => void;
}

export default function ProfileOverview({ profileData, onUpdate, onUpdateData }: ProfileOverviewProps) {
    const { profile, specializations = [], certifications = [], hourlyRate, netWorth, memberSince } = profileData;

    // State for notes
    const [noteDraft, setNoteDraft] = useState('');
    const [notes, setNotes] = useState<Array<{ id: string; text: string; at: string }>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('profile_notes');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [savingNote, setSavingNote] = useState(false);

    // Calendar state
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    // Edit mode state
    const [editingSpecs, setEditingSpecs] = useState(false);
    const [editingCerts, setEditingCerts] = useState(false);
    const [editingRate, setEditingRate] = useState(false);
    const [localSpecs, setLocalSpecs] = useState<Specialization[]>([]);
    const [localCerts, setLocalCerts] = useState<Certification[]>([]);
    const [localRate, setLocalRate] = useState<string>('');
    const [newSpecName, setNewSpecName] = useState('');
    const [newCertName, setNewCertName] = useState('');
    const [saving, setSaving] = useState(false);

    // Note handling
    const handleSaveNote = async () => {
        if (!noteDraft.trim()) return;
        setSavingNote(true);
        const newNote = { id: Date.now().toString(), text: noteDraft.trim(), at: new Date().toISOString() };
        const updatedNotes = [newNote, ...notes];
        setNotes(updatedNotes);
        setNoteDraft('');
        try {
            localStorage.setItem('profile_notes', JSON.stringify(updatedNotes));
        } finally {
            setSavingNote(false);
        }
    };

    // Specializations
    const startEditingSpecs = () => {
        setLocalSpecs(specializations || []);
        setEditingSpecs(true);
    };

    const addSpecialization = () => {
        if (!newSpecName.trim()) return;
        const newSpec: Specialization = {
            id: Date.now().toString(),
            name: newSpecName.trim(),
            selected: true
        };
        setLocalSpecs([...localSpecs, newSpec]);
        setNewSpecName('');
    };

    const toggleSpec = (id: string) => {
        setLocalSpecs(localSpecs.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
    };

    const deleteSpec = (id: string) => {
        setLocalSpecs(localSpecs.filter(s => s.id !== id));
    };

    const saveSpecs = async () => {
        setSaving(true);
        try {
            // Check if updateProfile supports specializations update, assuming it does or we need a specific endpoint
            // The original code used updateProfile checking logic
            await updateProfile({ specializations: localSpecs } as any);
            onUpdateData({ specializations: localSpecs });
            setEditingSpecs(false);
        } catch (e) {
            console.error('Failed to save specializations:', e);
        } finally {
            setSaving(false);
        }
    };

    // Certifications
    const startEditingCerts = () => {
        setLocalCerts(certifications || []);
        setEditingCerts(true);
    };

    const addCertification = () => {
        if (!newCertName.trim()) return;
        const newCert: Certification = {
            id: Date.now().toString(),
            name: newCertName.trim(),
            level: true
        };
        setLocalCerts([...localCerts, newCert]);
        setNewCertName('');
    };

    const toggleCert = (id: string) => {
        setLocalCerts(localCerts.map(c => c.id === id ? { ...c, level: !c.level } : c));
    };

    const deleteCert = (id: string) => {
        setLocalCerts(localCerts.filter(c => c.id !== id));
    };

    const saveCerts = async () => {
        setSaving(true);
        try {
            await updateProfile({ certifications: localCerts } as any);
            onUpdateData({ certifications: localCerts });
            setEditingCerts(false);
        } catch (e) {
            console.error('Failed to save certifications:', e);
        } finally {
            setSaving(false);
        }
    };

    // Hourly Rate
    const startEditingRate = () => {
        setLocalRate(hourlyRate?.toString() || '');
        setEditingRate(true);
    };

    const saveRate = async () => {
        setSaving(true);
        try {
            const rate = parseFloat(localRate) || undefined;
            await updateProfile({ hourlyRate: rate } as any);
            onUpdateData({ hourlyRate: rate });
            setEditingRate(false);
        } catch (e) {
            console.error('Failed to save hourly rate:', e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Specializations */}
            <Card title="Specializations" icon={<CheckCircle2 size={18} className="text-emerald-500" />} actions={
                !editingSpecs ? (
                    <button onClick={startEditingSpecs} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">
                        <Edit2 size={14} className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400" />
                    </button>
                ) : null
            }>
                {editingSpecs ? (
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {localSpecs.map((spec) => (
                                <div key={spec.id} className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleSpec(spec.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border uppercase tracking-tighter transition ${spec.selected ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}
                                    >
                                        {spec.name}
                                    </button>
                                    <button onClick={() => deleteSpec(spec.id)} className="p-0.5 hover:bg-red-500/20 rounded">
                                        <X size={12} className="text-red-500 dark:text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSpecName}
                                onChange={(e) => setNewSpecName(e.target.value)}
                                placeholder="Add specialization..."
                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && addSpecialization()}
                            />
                            <button onClick={addSpecialization} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition">
                                <Plus size={16} className="text-emerald-600 dark:text-emerald-400" />
                            </button>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={saveSpecs} disabled={saving} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-1.5 rounded-lg transition disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => setEditingSpecs(false)} className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm rounded-lg transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {specializations.length > 0 ? specializations.map((spec) => (
                            <span key={spec.id} className={`px-4 py-2 rounded-xl text-[11px] font-bold border uppercase tracking-tighter ${spec.selected ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>
                                {spec.name}
                            </span>
                        )) : (
                            <span className="text-sm text-slate-500 italic">Click edit to add specializations</span>
                        )}
                    </div>
                )}
            </Card>

            {/* Certifications */}
            <Card title="Certifications" icon={<GraduationCap size={18} className="text-emerald-500" />} actions={
                !editingCerts ? (
                    <button onClick={startEditingCerts} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">
                        <Edit2 size={14} className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400" />
                    </button>
                ) : null
            }>
                {editingCerts ? (
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {localCerts.map((cert) => (
                                <div key={cert.id} className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleCert(cert.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${cert.level ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${cert.level ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-400 dark:bg-slate-500'}`} />
                                        <span className={`text-xs font-semibold ${cert.level ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-300'}`}>{cert.name}</span>
                                    </button>
                                    <button onClick={() => deleteCert(cert.id)} className="p-0.5 hover:bg-red-500/20 rounded">
                                        <X size={12} className="text-red-500 dark:text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCertName}
                                onChange={(e) => setNewCertName(e.target.value)}
                                placeholder="Add certification..."
                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && addCertification()}
                            />
                            <button onClick={addCertification} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition">
                                <Plus size={16} className="text-emerald-600 dark:text-emerald-400" />
                            </button>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={saveCerts} disabled={saving} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-1.5 rounded-lg transition disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => setEditingCerts(false)} className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm rounded-lg transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {certifications.length > 0 ? certifications.map((cert) => (
                            <div key={cert.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-xl">
                                <div className={`w-1.5 h-1.5 rounded-full ${cert.level ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-400 dark:bg-slate-600'}`} />
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{cert.name}</span>
                            </div>
                        )) : (
                            <span className="text-sm text-slate-500 italic">Click edit to add certifications</span>
                        )}
                    </div>
                )}
            </Card>

            {/* General */}
            <Card title="General" icon={<Info size={18} className="text-emerald-500" />}>
                <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Hourly Rate</span>
                        {editingRate ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={localRate}
                                    onChange={(e) => setLocalRate(e.target.value)}
                                    className="w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                                    placeholder="0.00"
                                />
                                <button onClick={saveRate} disabled={saving} className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 rounded transition">
                                    <Save size={14} className="text-emerald-600 dark:text-emerald-400" />
                                </button>
                                <button onClick={() => setEditingRate(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">
                                    <X size={14} className="text-slate-400" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-slate-900 dark:text-white font-bold"><PriceDisplay amount={hourlyRate || 0} />/h</span>
                                <button onClick={startEditingRate} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">
                                    <Edit2 size={12} className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Member since</span>
                        <span className="text-slate-900 dark:text-white font-medium">{memberSince ? new Date(memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Net Worth</span>
                        <span className="text-slate-900 dark:text-white font-bold"><PriceDisplay amount={netWorth || 0} /></span>
                    </div>
                </div>
            </Card>

            {/* Contacts */}
            <Card title="Contacts" icon={<Mail size={18} className="text-emerald-500" />}>
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg group-hover:bg-emerald-500/10 transition"><Phone size={14} className="text-slate-400 group-hover:text-emerald-500" /></div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Phone</span>
                        </div>
                        <span className="text-sm text-slate-900 dark:text-white font-medium">{profile.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg group-hover:bg-emerald-500/10 transition"><Mail size={14} className="text-slate-400 group-hover:text-emerald-500" /></div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">E-mail</span>
                        </div>
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium truncate ml-4">{profile.email}</span>
                    </div>
                </div>
            </Card>

            {/* Calendar */}
            <Card
                title={currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                icon={<CalendarIcon size={18} className="text-emerald-500" />}
                actions={
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronLeft size={16} /></button>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronRight size={16} /></button>
                    </div>
                }
            >
                <div className="text-slate-800 dark:text-slate-200">
                    <Calendar month={currentMonth} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upcoming</span>
                        <button className="text-[10px] text-emerald-500 font-bold hover:underline">View All</button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><CalendarIcon size={16} className="text-emerald-500" /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Q1 Earnings Call</p>
                            <p className="text-[10px] text-slate-500">10:00 AM - 11:30 AM</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Private Notes */}
            <Card title="Private Notes" icon={<FileText size={18} className="text-emerald-500" />}>
                <div className="relative">
                    <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Draft your strategy..."
                        className="w-full bg-transparent border border-slate-200 dark:border-slate-600 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 h-40 focus:outline-none focus:border-emerald-500/50 transition resize-none placeholder-slate-400"
                    />
                    {notes.length > 0 && (
                        <div className="absolute top-3 right-3">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">Saved</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-1 text-slate-400">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><Bold size={14} /></button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><Italic size={14} /></button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"><List size={14} /></button>
                    </div>
                    <button
                        onClick={handleSaveNote}
                        disabled={!noteDraft.trim() || savingNote}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-black font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition"
                    >
                        <Save size={14} /> Save Note
                    </button>
                </div>
                {notes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-600 space-y-3 max-h-32 overflow-y-auto custom-scrollbar">
                        {notes.map((note) => (
                            <div key={note.id} className="text-[11px] bg-slate-50 dark:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-600/50">
                                <div className="text-slate-400 mb-1">{new Date(note.at).toLocaleDateString()}</div>
                                <div className="text-slate-700 dark:text-slate-300 italic">"{note.text}"</div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

// Internal Card component to match the style
function Card({ title, icon, children, actions }: { title: string; icon?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                        {icon}
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm tracking-wide">{title}</h3>
                </div>
                {actions}
            </div>
            {children}
        </div>
    );
}
