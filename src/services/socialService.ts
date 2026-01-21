/**
 * Social API Service
 * Handles all social feature API calls
 */
import api from './api';

// Types
export interface UserProfile {
    id: number;
    userId: number;
    publicUsername: string | null;
    bio: string | null;
    tradingStyle: string;
    profileVisibility: 'public' | 'private' | 'anonymous';
    showPortfolio: boolean;
    showPerformance: boolean;
    showTrades: boolean;
    followersCount: number;
    followingCount: number;
    ideasCount: number;
    likesReceived: number;
    user?: {
        id: number;
        name: string;
        avatarUrl: string | null;
        verifiedBadge: boolean;
    };
}

export interface TradingIdea {
    id: string;
    userId: number;
    symbol: string | null;
    title: string;
    content: string;
    ideaType: 'long' | 'short' | 'neutral';
    targetPrice: number | null;
    stopLoss: number | null;
    entryPrice: number | null;
    timeframe: string | null;
    status: string;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    isPublic: boolean;
    createdAt: string;
    author?: {
        id: number;
        name: string;
        avatarUrl: string | null;
        verifiedBadge: boolean;
        username: string | null;
    };
}

export interface IdeaComment {
    id: string;
    ideaId: string;
    userId: number;
    parentId: string | null;
    content: string;
    likesCount: number;
    createdAt: string;
    author?: {
        id: number;
        name: string;
        avatarUrl: string | null;
    };
}

export interface DiscussionGroup {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    iconUrl: string | null;
    coverUrl: string | null;
    groupType: 'public' | 'private' | 'invite_only';
    category: string;
    membersCount: number;
    postsCount: number;
    ownerId: number;
    createdAt: string;
}

export interface GroupPost {
    id: string;
    groupId: string;
    userId: number;
    title: string | null;
    content: string;
    postType: string;
    likesCount: number;
    commentsCount: number;
    isPinned: boolean;
    createdAt: string;
    author?: {
        id: number;
        name: string;
        avatarUrl: string | null;
    };
}

export interface Badge {
    id: string;
    name: string;
    slug: string;
    description: string;
    iconUrl: string | null;
    category: string;
    tier: string;
    pointsAwarded: number;
}

export interface UserBadge {
    id: string;
    userId: number;
    badgeId: string;
    createdAt: string;
    badge?: Badge;
}

// ===================
// PROFILES
// ===================
export const profilesApi = {
    list: (params?: { page?: number; trading_style?: string; sort_by?: string }) =>
        api.get<{ profiles: UserProfile[]; total: number }>('/social/profiles', params),

    get: (username: string) =>
        api.get<{ profile: UserProfile }>(`/social/profiles/${username}`),

    getPublic: (usernameOrId: string | number) =>
        api.get<{ profile: UserProfile }>(`/social/profiles/${usernameOrId}`),

    getMyProfile: () =>
        api.get<{ profile: UserProfile; user: any }>('/social/profiles/me'),

    updateProfile: (data: Partial<UserProfile>) =>
        api.put<{ success: boolean; profile: UserProfile }>('/social/profiles/me', data),

    checkUsername: (username: string) =>
        api.get<{ available: boolean }>(`/social/profiles/check-username/${username}`),
};

// ===================
// FOLLOW
// ===================
export const followApi = {
    follow: (userId: number) =>
        api.post<{ success: boolean }>(`/social/follow/${userId}`),

    unfollow: (userId: number) =>
        api.del<{ success: boolean }>(`/social/follow/${userId}`),

    checkFollowing: (userId: number) =>
        api.get<{ isFollowing: boolean }>(`/social/follow/check/${userId}`),

    checkStatus: (userId: number) =>
        api.get<{ isFollowing: boolean }>(`/social/follow/check/${userId}`),

    getFollowers: (params?: { page?: number }) =>
        api.get<{ followers: any[]; total: number }>('/social/follow/followers', params),

    getFollowing: (params?: { page?: number }) =>
        api.get<{ following: any[]; total: number }>('/social/follow/following', params),
};

// ===================
// IDEAS
// ===================
export const ideasApi = {
    list: (params?: { page?: number; symbol?: string; type?: string; sort_by?: string }) =>
        api.get<{ ideas: TradingIdea[]; total: number; pages: number }>('/social/ideas', params),

    get: (id: string) =>
        api.get<{ idea: TradingIdea }>(`/social/ideas/${id}`),

    create: (data: { title: string; content: string; ideaType: string; symbol?: string; entryPrice?: number; targetPrice?: number; stopLoss?: number; timeframe?: string; isPublic?: boolean }) =>
        api.post<{ success: boolean; idea: TradingIdea }>('/social/ideas', data),

    update: (id: string, data: Partial<TradingIdea>) =>
        api.put<{ success: boolean; idea: TradingIdea }>(`/social/ideas/${id}`, data),

    delete: (id: string) =>
        api.del<{ success: boolean }>(`/social/ideas/${id}`),

    like: (id: string) =>
        api.post<{ success: boolean; liked: boolean; likesCount: number }>(`/social/ideas/${id}/like`),

    getComments: (id: string) =>
        api.get<{ comments: IdeaComment[] }>(`/social/ideas/${id}/comments`),

    addComment: (id: string, content: string, parentId?: string) =>
        api.post<{ success: boolean; comment: IdeaComment }>(`/social/ideas/${id}/comments`, { content, parentId }),

    getMyIdeas: (params?: { page?: number }) =>
        api.get<{ ideas: TradingIdea[]; total: number }>('/social/ideas/my', params),
};

// ===================
// GROUPS
// ===================
export const groupsApi = {
    list: (params?: { page?: number; category?: string; search?: string }) =>
        api.get<{ groups: DiscussionGroup[]; total: number }>('/social/groups', params),

    get: (id: string) =>
        api.get<{ group: DiscussionGroup }>(`/social/groups/${id}`),

    create: (data: { name: string; description?: string; category?: string; groupType?: string }) =>
        api.post<{ success: boolean; group: DiscussionGroup }>('/social/groups', data),

    join: (id: string) =>
        api.post<{ success: boolean }>(`/social/groups/${id}/join`),

    leave: (id: string) =>
        api.post<{ success: boolean }>(`/social/groups/${id}/leave`),

    getPosts: (id: string, params?: { page?: number }) =>
        api.get<{ posts: GroupPost[]; total: number }>(`/social/groups/${id}/posts`, params),

    createPost: (id: string, data: { content: string; title?: string }) =>
        api.post<{ success: boolean; post: GroupPost }>(`/social/groups/${id}/posts`, data),

    getMembers: (id: string) =>
        api.get<{ members: any[]; total: number }>(`/social/groups/${id}/members`),

    getMyGroups: () =>
        api.get<{ groups: DiscussionGroup[] }>('/social/groups/my'),
};

// ===================
// BADGES
// ===================
export const badgesApi = {
    list: () =>
        api.get<{ badges: Badge[] }>('/social/badges'),

    getMyBadges: () =>
        api.get<{ badges: UserBadge[]; totalPoints: number; badgeCount: number }>('/social/badges/my'),

    getUserBadges: (userId: number) =>
        api.get<{ badges: UserBadge[]; badgeCount: number }>(`/social/badges/user/${userId}`),

    getLeaderboard: (limit?: number) =>
        api.get<{ leaderboard: any[] }>('/social/badges/leaderboard', limit ? { limit } : undefined),
};

export default {
    profiles: profilesApi,
    follow: followApi,
    ideas: ideasApi,
    groups: groupsApi,
    badges: badgesApi,
};
