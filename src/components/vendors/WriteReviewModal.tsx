'use client';

import { useState } from 'react';
import { submitVendorReview } from '@/services/vendorService';
import { Star, X } from 'lucide-react';

interface Props {
    vendorId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function WriteReviewModal({ vendorId, isOpen, onClose, onSuccess }: Props) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) return alert('Please select a rating');
        setSubmitting(true);
        try {
            await submitVendorReview(vendorId, { rating, comment });
            onSuccess();
            onClose();
            setRating(0);
            setComment('');
        } catch (error) {
            alert('Failed to submit review. Please ensure you are logged in.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 relative shadow-2xl border border-slate-200 dark:border-slate-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Write a Review</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={32}
                                        className={`${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Your Review</label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Share your experience with this vendor..."
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[120px]"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
}
