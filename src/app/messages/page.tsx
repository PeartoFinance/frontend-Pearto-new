'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    MessageCircle, Search, Send, Plus, MoreVertical,
    Check, CheckCheck, User, Phone, Video
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TickerTape from '@/components/layout/TickerTape';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from 'sonner';
import Footer from '@/components/layout/Footer';

interface Conversation {
    id: string;
    type: 'direct' | 'group';
    title: string | null;
    lastMessageAt: string | null;
    participants: { id: number; name: string; avatarUrl: string | null }[];
    lastMessage?: { content: string; senderId: number; createdAt: string };
    unreadCount: number;
}

interface Message {
    id: string;
    conversationId: string;
    senderId: number;
    content: string;
    messageType: string;
    createdAt: string;
    isMine: boolean;
    sender?: { id: number; name: string; avatarUrl: string | null };
}

export default function MessagesPage() {
    const { isAuthenticated, user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchConversations();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv.id);
        }
    }, [selectedConv]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await api.get<{ conversations: Conversation[] }>('/social/messages/conversations');
            setConversations(res.conversations);
            if (res.conversations.length > 0 && !selectedConv) {
                setSelectedConv(res.conversations[0]);
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        }
        setLoading(false);
    };

    const fetchMessages = async (convId: string) => {
        try {
            const res = await api.get<{ messages: Message[] }>(`/social/messages/conversations/${convId}`);
            setMessages(res.messages);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConv || sending) return;
        setSending(true);
        try {
            const res = await api.post<{ message: Message }>(`/social/messages/conversations/${selectedConv.id}`, {
                content: newMessage
            });
            setMessages([...messages, res.message]);
            setNewMessage('');
            fetchConversations(); // Refresh to update last message
        } catch (err) {
            console.error('Failed to send message:', err);
        }
        setSending(false);
    };

    const getOtherParticipant = (conv: Conversation) => {
        if (conv.participants.length > 0) {
            return conv.participants[0];
        }
        return null;
    };

    if (!isAuthenticated) {
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
                            <MessageCircle size={64} className="mx-auto text-slate-300 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Sign in to view messages</h2>
                            <Link href="/login" className="text-emerald-500 hover:underline">Sign in now</Link>
                        </div>
                    </div>
                  <Footer />
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
                <div className="flex-1 pt-[112px] md:pt-[120px] flex">
                    {/* Conversations List */}
                    <div className="w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col h-[calc(100vh-120px)]">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
                                <button
                                    onClick={() => toast.info('New conversations coming soon!')}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    <Plus size={20} className="text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 animate-pulse">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                                            <div className="flex-1">
                                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                                                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <MessageCircle size={32} className="mx-auto mb-2 text-slate-300" />
                                    No conversations yet
                                </div>
                            ) : (
                                conversations.map((conv) => {
                                    const other = getOtherParticipant(conv);
                                    const isSelected = selectedConv?.id === conv.id;

                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConv(conv)}
                                            className={`w-full flex items-center gap-3 p-4 text-left transition ${isSelected
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-2 border-emerald-500'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                }`}
                                        >
                                            {other?.avatarUrl ? (
                                                <img src={other.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                    <span className="text-white font-bold">{other?.name?.charAt(0) || '?'}</span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-slate-900 dark:text-white truncate">
                                                        {conv.title || other?.name || 'Unknown'}
                                                    </span>
                                                    {conv.lastMessage && (
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-slate-500 truncate flex-1">
                                                        {conv.lastMessage?.content || 'No messages yet'}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
                        {selectedConv ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getOtherParticipant(selectedConv)?.avatarUrl ? (
                                            <img
                                                src={getOtherParticipant(selectedConv)!.avatarUrl!}
                                                alt=""
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                <span className="text-white font-bold">
                                                    {getOtherParticipant(selectedConv)?.name?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {selectedConv.title || getOtherParticipant(selectedConv)?.name}
                                            </h3>
                                            <span className="text-xs text-emerald-500">Online</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toast.info('Voice calls coming soon!')}
                                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            <Phone size={18} className="text-slate-500" />
                                        </button>
                                        <button
                                            onClick={() => toast.info('Video calls coming soon!')}
                                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            <Video size={18} className="text-slate-500" />
                                        </button>
                                        <button
                                            onClick={() => toast.info('More options coming soon!')}
                                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            <MoreVertical size={18} className="text-slate-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] ${msg.isMine ? 'order-2' : ''}`}>
                                                <div className={`px-4 py-2.5 rounded-2xl ${msg.isMine
                                                    ? 'bg-emerald-500 text-white rounded-br-md'
                                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md border border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                    <p>{msg.content}</p>
                                                </div>
                                                <div className={`text-xs text-slate-400 mt-1 ${msg.isMine ? 'text-right' : ''}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {msg.isMine && <CheckCheck size={14} className="inline ml-1" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim() || sending}
                                            className="p-3 rounded-xl bg-emerald-500 text-white disabled:opacity-50 hover:bg-emerald-600 transition"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-500">
                                <div className="text-center">
                                    <MessageCircle size={48} className="mx-auto mb-4 text-slate-300" />
                                    <p>Select a conversation to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
