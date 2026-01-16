'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { get, post } from '@/services/api';

interface Document {
    id: string;
    documentType: string;
    fileUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedAt: string | null;
    notes: string | null;
    createdAt: string;
}

const DOCUMENT_TYPES = [
    { id: 'id_card', label: 'ID Card / Passport' },
    { id: 'address_proof', label: 'Proof of Address' },
    { id: 'selfie', label: 'Selfie with ID' },
    { id: 'bank_statement', label: 'Bank Statement' },
];

export default function ProfileDocuments() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState('');

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const data = await get<Document[]>('/user/documents');
            setDocuments(data);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file: File) => {
        if (!selectedType) {
            alert('Please select a document type');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', selectedType);

            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com/api';
            await fetch(`${apiBase}/user/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
                body: formData,
            });

            setSelectedType('');
            await loadDocuments();
        } catch (error) {
            console.error('Failed to upload document:', error);
        } finally {
            setUploading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="text-emerald-500" size={20} />;
            case 'rejected': return <XCircle className="text-red-500" size={20} />;
            default: return <Clock className="text-yellow-500" size={20} />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return { text: 'Approved', color: 'text-emerald-500 bg-emerald-500/10' };
            case 'rejected': return { text: 'Rejected', color: 'text-red-500 bg-red-500/10' };
            default: return { text: 'Pending', color: 'text-yellow-500 bg-yellow-500/10' };
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
                <h2 className="text-2xl font-bold text-white">Documents</h2>
                <p className="text-slate-400 mt-1">Upload documents for KYC verification</p>
            </div>

            {/* Upload Section */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Upload New Document</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Document Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        >
                            <option value="">Select type...</option>
                            {DOCUMENT_TYPES.map((type) => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                            className="hidden"
                            id="document-upload"
                            disabled={uploading || !selectedType}
                        />
                        <label htmlFor="document-upload" className="cursor-pointer">
                            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                            <p className="text-slate-400">
                                {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">PNG, JPG or PDF up to 10MB</p>
                        </label>
                    </div>
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="p-4 border-b border-slate-700">
                    <h3 className="font-semibold text-white">Uploaded Documents</h3>
                </div>
                {documents.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No documents uploaded yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {documents.map((doc) => {
                            const status = getStatusLabel(doc.status);
                            const typeLabel = DOCUMENT_TYPES.find(t => t.id === doc.documentType)?.label || doc.documentType;

                            return (
                                <div key={doc.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(doc.status)}
                                        <div>
                                            <div className="font-medium text-white">{typeLabel}</div>
                                            <div className="text-sm text-slate-400">
                                                Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                                            {status.text}
                                        </span>
                                        {doc.notes && (
                                            <span className="text-sm text-slate-400" title={doc.notes}>
                                                <AlertCircle size={16} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
