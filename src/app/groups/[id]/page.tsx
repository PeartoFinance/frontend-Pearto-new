'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    Users, MessageSquare, Send, UserPlus, UserMinus, Settings,
    MoreVertical, ThumbsUp, Clock, Lock
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { groupsApi, DiscussionGroup, GroupPost } from '@/services/socialService';
import { useAuth } from '@/context/AuthContext';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isAuthenticated, user } = useAuth();
    const [group, setGroup] = useState<DiscussionGroup | null>(null);
    const [posts, setPosts] = useState<GroupPost[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [posting, setPosting] = useState(false);
    const [activeTab, setActiveTab] = useState<'feed' | 'members'>('feed');

    useEffect(() => {
        const fetchGroup = async () => {
            setLoading(true);
            try {
                const [groupRes, postsRes, membersRes] = await Promise.all([
                    groupsApi.get(id),
                    groupsApi.getPosts(id),
                    groupsApi.getMembers(id)
                ]);
                setGroup(groupRes.group);
                setPosts(postsRes.posts);
                setMembers(membersRes.members);

                // Check membership - convert to number for robust comparison
                if (isAuthenticated && user?.id) {
                    const userId = Number(user.id);
                    const found = membersRes.members.some((m: any) => Number(m.id) === userId);
                    console.log('Membership check:', { user, userId, members: membersRes.members.map((m: any) => m.id), found });
                    setIsMember(found);
                }
            } catch (err) {
                console.error('Failed to fetch group:', err);
            }
            setLoading(false);
        };
        fetchGroup();
    }, [id, isAuthenticated, user]);

    const handleJoinLeave = async () => {
        if (!group) return;
        try {
            if (isMember) {
                await groupsApi.leave(group.id);
                setIsMember(false);
            } else {
                await groupsApi.join(group.id);
                setIsMember(true);
            }
        } catch (err) {
            console.error('Join/leave failed:', err);
        }
    };

    const handlePost = async () => {
        if (!newPost.trim() || !group || posting) return;
        setPosting(true);
        try {
            const res = await groupsApi.createPost(group.id, { content: newPost });
            setPosts([res.post, ...posts]);
            setNewPost('');
        } catch (err) {
            console.error('Failed to post:', err);
        }
        setPosting(false);
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
                            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6" />
                            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!group) {
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
                            <Users size={64} className="mx-auto text-slate-300 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Group not found</h2>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

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
                    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
                        {/* Group Header */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                            {/* Cover */}
                            <div className="h-40 bg-gradient-to-br from-cyan-500 via-emerald-500 to-teal-500 relative">
                                {group.coverUrl && (
                                    <img src={group.coverUrl} alt="" className="w-full h-full object-cover absolute inset-0" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="px-6 pb-6">
                                <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
                                    <div className="w-24 h-24 rounded-xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center bg-gradient-to-br from-cyan-500 to-emerald-500">
                                        {group.iconUrl ? (
                                            <img src={group.iconUrl} alt="" className="w-16 h-16 rounded-lg" />
                                        ) : (
                                            <Users size={40} className="text-white" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{group.name}</h1>
                                            {group.groupType === 'private' && <Lock size={18} className="text-slate-400" />}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                            <span>{group.membersCount} members</span>
                                            <span>{group.postsCount} posts</span>
                                            <span className="capitalize">{group.category}</span>
                                        </div>
                                    </div>

                                    {isAuthenticated && (
                                        <button
                                            onClick={handleJoinLeave}
                                            className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition ${isMember
                                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                }`}
                                        >
                                            {isMember ? <UserMinus size={18} /> : <UserPlus size={18} />}
                                            {isMember ? 'Leave Group' : 'Join Group'}
                                        </button>
                                    )}
                                </div>

                                {group.description && (
                                    <p className="text-slate-600 dark:text-slate-400 mt-4">{group.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 mb-6 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                            <button
                                onClick={() => setActiveTab('feed')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'feed'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <MessageSquare size={16} className="inline mr-2" />
                                Feed
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'members'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Users size={16} className="inline mr-2" />
                                Members ({members.length})
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'feed' ? (
                            <div className="space-y-4">
                                {/* Post Input */}
                                {isMember && (
                                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                        <textarea
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            placeholder="Share something with the group..."
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 resize-none"
                                        />
                                        <div className="flex justify-end mt-3">
                                            <button
                                                onClick={handlePost}
                                                disabled={!newPost.trim() || posting}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-xl disabled:opacity-50 hover:bg-emerald-600 transition"
                                            >
                                                <Send size={18} />
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Posts */}
                                {posts.length === 0 ? (
                                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                                        <p className="text-slate-500">No posts yet. Be the first to share!</p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-start gap-3">
                                                {post.author?.avatarUrl ? (
                                                    <img src={post.author.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                        <span className="text-white font-bold">{post.author?.name?.charAt(0) || '?'}</span>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-900 dark:text-white">{post.author?.name}</span>
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {new Date(post.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-700 dark:text-slate-300 mt-2">{post.content}</p>
                                                </div>
                                                <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                                                    <MoreVertical size={16} className="text-slate-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                {members.map((member, i) => (
                                    <Link
                                        key={member.userId}
                                        href={`/investors/${member.userId}`}
                                        className={`flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${i !== 0 ? 'border-t border-slate-100 dark:border-slate-700' : ''
                                            }`}
                                    >
                                        {member.avatarUrl ? (
                                            <img src={member.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                                <span className="text-white font-bold">{member.name?.charAt(0)}</span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-900 dark:text-white">{member.name}</span>
                                                {member.role === 'admin' && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">Admin</span>
                                                )}
                                                {member.role === 'moderator' && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">Mod</span>
                                                )}
                                            </div>
                                            <span className="text-sm text-slate-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
