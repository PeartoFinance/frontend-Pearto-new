'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Heart, MessageCircle, Eye, Share2, TrendingUp, TrendingDown,
    Minus, Clock, Target, Shield, Send, MoreHorizontal, Flag, Bookmark
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { useAuth } from '@/context/AuthContext';
import { ideasApi, TradingIdea, IdeaComment } from '@/services/socialService';

const IDEA_TYPE_STYLES = {
    long: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: TrendingUp, label: 'Bullish' },
    short: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: TrendingDown, label: 'Bearish' },
    neutral: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400', icon: Minus, label: 'Neutral' },
};

function CommentItem({ comment }: { comment: IdeaComment }) {
    return (
        <div className="flex gap-3 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
            {comment.author?.avatarUrl ? (
                <img src={comment.author.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{comment.author?.name?.charAt(0) || '?'}</span>
                </div>
            )}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900 dark:text-white text-sm">{comment.author?.name}</span>
                    <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{comment.content}</p>
            </div>
        </div>
    );
}

export default function IdeaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const ideaId = params.id as string;

    const [idea, setIdea] = useState<TradingIdea | null>(null);
    const [comments, setComments] = useState<IdeaComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchIdea = async () => {
            try {
                const [ideaRes, commentsRes] = await Promise.all([
                    ideasApi.get(ideaId),
                    ideasApi.getComments(ideaId)
                ]);
                setIdea(ideaRes.idea);
                setLikesCount(ideaRes.idea.likesCount);
                setComments(commentsRes.comments);
            } catch (err) {
                console.error('Failed to fetch idea:', err);
            }
            setLoading(false);
        };
        if (ideaId) fetchIdea();
    }, [ideaId]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        try {
            const res = await ideasApi.like(ideaId);
            setLiked(res.liked);
            setLikesCount(res.likesCount);
        } catch (err) {
            console.error('Failed to like:', err);
        }
    };

    const handleComment = async () => {
        if (!newComment.trim() || !isAuthenticated) return;
        setSubmitting(true);
        try {
            const res = await ideasApi.addComment(ideaId, newComment);
            setComments([...comments, res.comment]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to comment:', err);
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px]">
                        <div className="p-4 lg:p-6 animate-pulse">
                            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
                                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!idea) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Idea not found</h2>
                            <Link href="/ideas" className="text-emerald-500 hover:underline mt-4 inline-block">Back to Ideas</Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const typeStyle = IDEA_TYPE_STYLES[idea.ideaType] || IDEA_TYPE_STYLES.neutral;
    const TypeIcon = typeStyle.icon;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-gray-50 dark:bg-slate-900">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px]">
                    <div className="p-4 lg:p-6 max-w-4xl">
                        {/* Back */}
                        <Link href="/ideas" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6">
                            <ArrowLeft size={18} />
                            Back to Ideas
                        </Link>

                        {/* Main Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {/* Author header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    {idea.author?.avatarUrl ? (
                                        <img src={idea.author.avatarUrl} alt={idea.author.name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">{idea.author?.name?.charAt(0) || 'U'}</span>
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">{idea.author?.name}</span>
                                            {idea.author?.verifiedBadge && (
                                                <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">✓</span>
                                            )}
                                        </div>
                                        {idea.author?.username && (
                                            <Link href={`/investors/${idea.author.username}`} className="text-sm text-emerald-500 hover:underline">
                                                @{idea.author.username}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${typeStyle.bg} ${typeStyle.text}`}>
                                        <TypeIcon size={18} />
                                        {typeStyle.label}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {idea.symbol && (
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 font-mono text-lg mb-4">
                                        <span className="font-bold text-slate-900 dark:text-white">{idea.symbol}</span>
                                    </div>
                                )}

                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{idea.title}</h1>

                                <div className="prose dark:prose-invert max-w-none mb-6">
                                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{idea.content}</p>
                                </div>

                                {/* Price Targets */}
                                {(idea.entryPrice || idea.targetPrice || idea.stopLoss) && (
                                    <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 mb-6">
                                        {idea.entryPrice && (
                                            <div className="text-center">
                                                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Entry</div>
                                                <div className="text-xl font-bold text-slate-900 dark:text-white">${idea.entryPrice}</div>
                                            </div>
                                        )}
                                        {idea.targetPrice && (
                                            <div className="text-center">
                                                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                                                    <Target size={12} /> Target
                                                </div>
                                                <div className="text-xl font-bold text-emerald-600">${idea.targetPrice}</div>
                                            </div>
                                        )}
                                        {idea.stopLoss && (
                                            <div className="text-center">
                                                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                                                    <Shield size={12} /> Stop Loss
                                                </div>
                                                <div className="text-xl font-bold text-red-600">${idea.stopLoss}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Meta */}
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        {new Date(idea.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Eye size={14} />
                                        {idea.viewsCount} views
                                    </span>
                                    {idea.timeframe && (
                                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs">
                                            Timeframe: {idea.timeframe}
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${liked
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                            }`}
                                    >
                                        <Heart size={18} className={liked ? 'fill-current' : ''} />
                                        {likesCount}
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200">
                                        <MessageCircle size={18} />
                                        {comments.length}
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200">
                                        <Share2 size={18} />
                                        Share
                                    </button>
                                    <button className="ml-auto p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                                        <Bookmark size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
                                Comments ({comments.length})
                            </h3>

                            {/* Add comment */}
                            {isAuthenticated ? (
                                <div className="flex gap-3 mb-6">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-bold">Y</span>
                                    </div>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                                            placeholder="Add a comment..."
                                            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                        />
                                        <button
                                            onClick={handleComment}
                                            disabled={submitting || !newComment.trim()}
                                            className="px-4 py-2 rounded-lg bg-emerald-500 text-white disabled:opacity-50"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 mb-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <Link href="/login" className="text-emerald-500 hover:underline">Sign in</Link> to comment
                                </div>
                            )}

                            {/* Comments list */}
                            {comments.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No comments yet. Be the first!</p>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {comments.map((comment) => (
                                        <CommentItem key={comment.id} comment={comment} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
