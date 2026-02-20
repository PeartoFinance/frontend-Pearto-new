/**
 * Authentication Service
 * Handles login, signup, and OAuth API calls
 */

import { post } from './api';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    countryCode?: string;
    isVerified?: boolean;
    hasPassword?: boolean;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface SignupResponse {
    message: string;
    userId: string;
}

export interface GoogleSignInData {
    idToken: string;
    firebase_uid: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
    return post<LoginResponse>('/auth/login', { email, password });
}

/**
 * Register a new user
 */
export async function signup(name: string, email: string, password: string): Promise<SignupResponse> {
    return post<SignupResponse>('/auth/signup', { name, email, password });
}

/**
 * Sync Google OAuth user with backend
 */
export async function googleSignIn(data: GoogleSignInData): Promise<LoginResponse> {
    return post<LoginResponse>('/auth/google-signin', data);
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
    return post<{ message: string }>('/auth/reset-password', { email });
}

/**
 * Verify email token
 */
export async function verifyEmail(token: string): Promise<{ message: string }> {
    return post<{ message: string }>('/auth/verify-email', { token });
}

/**
 * Set password for Google-logged in user
 */
export async function setPassword(password: string): Promise<{ message: string; token?: string }> {
    return post<{ message: string; token?: string }>('/auth/set-password', { password });
}

export default {
    login,
    signup,
    googleSignIn,
    requestPasswordReset,
    verifyEmail,
    setPassword,
};
