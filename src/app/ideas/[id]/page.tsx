'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Heart, MessageCircle, Eye, Share2, TrendingUp, TrendingDown,
    Minus, Clock, Target, Shield, Send, Bookmark, UserCheck
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { useAuth } from '@/context/AuthContext';
import { ideasApi, TradingIdea, IdeaComment } from '@/services/socialService';
import PriceDisplay from '@/components/common/PriceDisplay';
import { toast } from 'sonner';

const IDEA_TYPE_STYLES = {
    long: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', icon: TrendingUp, label: 'Bullish' },
    short: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', icon: TrendingDown, label: 'Bearish' },
    neutral: { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', icon: Minus, label: 'Neutral' },
};

function CommentItem({ comment }: { comment: IdeaComment }) {
    return (
        <div className="flex gap-4 py-5 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-4 -mx-4 rounded-xl transition-colors">
            {comment.author?.avatarUrl ? (
                <img src={comment.author.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700" />
            ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400 font-bold">
                    {comment.author?.name?.charAt(0) || '?'}
                </div>
            )}
            <div className="flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                    <Link href={`/investors/${(comment.author as any)?.username || comment.author?.id}`} className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        {comment.author?.name}
                    </Link>
                    {(comment.author as any)?.verifiedBadge && <UserCheck size={14} className="text-emerald-500" />}
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{comment.content}</p>
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
            toast.success('Comment added!');
        } catch (err) {
            console.error('Failed to comment:', err);
            toast.error('Failed to add comment');
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] p-4 lg:p-8 animate-pulse">
                        <div className="max-w-4xl mx-auto">
                            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 mb-6 h-[500px]" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!idea) {
        return (
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen">
                    <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <TickerTape />
                        <Header />
                    </div>
                    <div className="flex-1 pt-[112px] md:pt-[120px] flex items-center justify-center p-4">
                        <div className="text-center bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-md">
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 dark:border-emerald-800/50">
                                <TrendingUp size={36} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Idea Not Found</h2>
                            <p className="text-slate-500 mb-8">The trading idea you're looking for doesn't exist.</p>
                            <Link href="/ideas" className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition-colors">
                                Browse Ideas
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const typeStyle = IDEA_TYPE_STYLES[idea.ideaType as keyof typeof IDEA_TYPE_STYLES] || IDEA_TYPE_STYLES.neutral;
    const TypeIcon = typeStyle.icon;

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                {/* Fixed Header */}
                <div className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <TickerTape />
                    <Header />
                </div>

                {/* Content */}
                <div className="flex-1 pt-[112px] md:pt-[120px] pb-12">
                    <div className="max-w-4xl mx-auto px-4 lg:px-6">

                        {/* Back Button */}
                        <Link href="/ideas" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium mb-6 transition-colors group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Ideas
                        </Link>

                        {/* Main Article Card */}
                        <article className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-8">

                            {/* Top decorative bar */}
                            <div className={`h-2 w-full ${idea.ideaType === 'long' ? 'bg-emerald-500' : idea.ideaType === 'short' ? 'bg-rose-500' : 'bg-slate-400'}`} />

                            <div className="p-6 md:p-10">
                                {/* Header: Author & Meta */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        <Link href={`/investors/${idea.author?.username || idea.author?.id}`}>
                                            {idea.author?.avatarUrl ? (
                                                <img src={idea.author.avatarUrl} alt={idea.author.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-slate-700 border border-emerald-100 dark:border-slate-600 flex items-center justify-center">
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">{idea.author?.name?.charAt(0) || 'U'}</span>
                                                </div>
                                            )}
                                        </Link>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/investors/${idea.author?.username || idea.author?.id}`} className="font-bold text-lg text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                                    {idea.author?.name}
                                                </Link>
                                                {idea.author?.verifiedBadge && (
                                                    <UserCheck size={16} className="text-emerald-500" />
                                                )}
                                            </div>
                                            <div className="text-sm text-slate-500 flex items-center gap-3">
                                                <span>{new Date(idea.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="flex items-center gap-1.5"><Eye size={14} /> {idea.viewsCount} views</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {idea.symbol && (
                                            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 font-bold font-mono tracking-wide border border-slate-200 dark:border-slate-600 text-sm">
                                                {idea.symbol}
                                            </span>
                                        )}
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                                            <TypeIcon size={16} />
                                            {typeStyle.label}
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">{idea.title}</h1>

                                {/* Price Targets Grid */}
                                {(idea.entryPrice || idea.targetPrice || idea.stopLoss) && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                                        {idea.entryPrice && (
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center text-center">
                                                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Entry</span>
                                                <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono"><PriceDisplay amount={idea.entryPrice} /></span>
                                            </div>
                                        )}
                                        {idea.targetPrice && (
                                            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/50 flex flex-col justify-center items-center text-center">
                                                <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-500 tracking-wider mb-1 flex items-center gap-1"><Target size={14} /> Target</span>
                                                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono"><PriceDisplay amount={idea.targetPrice} /></span>
                                            </div>
                                        )}
                                        {idea.stopLoss && (
                                            <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-4 border border-rose-100 dark:border-rose-800/50 flex flex-col justify-center items-center text-center">
                                                <span className="text-xs uppercase font-bold text-rose-600 dark:text-rose-500 tracking-wider mb-1 flex items-center gap-1"><Shield size={14} /> Stop Loss</span>
                                                <span className="text-2xl font-bold text-rose-700 dark:text-rose-400 font-mono"><PriceDisplay amount={idea.stopLoss} /></span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Main Content Body */}
                                <div className="prose prose-lg dark:prose-invert prose-emerald max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {idea.content}
                                </div>

                                {/* Actions Bar */}
                                <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-4">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors border ${liked
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <Heart size={20} className={liked ? 'fill-emerald-500 text-emerald-500' : ''} />
                                        <span>{likesCount} Likes</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const commentsSection = document.getElementById('comments-section');
                                            commentsSection?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <MessageCircle size={20} />
                                        <span>{comments.length} Comments</span>
                                    </button>

                                    <button
                                        onClick={async () => {
                                            const url = window.location.href;
                                            if (navigator.share) {
                                                await navigator.share({ title: idea?.title || 'Trading Idea', url });
                                            } else {
                                                await navigator.clipboard.writeText(url);
                                                toast.success('Link copied to clipboard!');
                                            }
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <Share2 size={20} />
                                        <span>Share</span>
                                    </button>

                                    <button
                                        onClick={() => toast.info('Bookmarks coming soon!')}
                                        className="ml-auto p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                        title="Bookmark Idea"
                                    >
                                        <Bookmark size={20} />
                                    </button>
                                </div>
                            </div>
                        </article>

                        {/* Comments Section */}
                        <div id="comments-section" className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 md:p-10 shadow-sm">
                            <h3 className="font-bold text-2xl text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">
                                Discussion ({comments.length})
                            </h3>

                            {/* Add comment */}
                            <div className="mb-10">
                                {isAuthenticated ? (
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-700 border border-emerald-100 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-emerald-600 dark:text-emerald-400 text-lg font-bold">U</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-end gap-3">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleComment();
                                                    }
                                                }}
                                                placeholder="Share your thoughts..."
                                                className="w-full min-h-[100px] p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-y text-slate-900 dark:text-white placeholder:text-slate-400"
                                            />
                                            <button
                                                onClick={handleComment}
                                                disabled={submitting || !newComment.trim()}
                                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                            >
                                                <Send size={18} />
                                                <span>Post Comment</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <MessageCircle size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">Join the conversation to share your thoughts.</p>
                                        <Link href="/login" className="inline-block px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
                                            Sign In
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Comments list */}
                            {comments.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-slate-500 text-lg">No comments yet. Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
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
