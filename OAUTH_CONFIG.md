# OAuth Configuration for Pearto App

## Firebase Console Setup

### 1. Authorized Domains
Go to [Firebase Console](https://console.firebase.google.com/project/pearto-app) → **Authentication** → **Settings** → **Authorized domains**

Add these domains:
- `localhost`
- `pearto-app.firebaseapp.com`
- Your production domain (e.g., `pearto.com`)

### 2. Google Cloud Console - OAuth Redirect URIs
Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → **OAuth 2.0 Client IDs** → Edit your Web client

Add these **Authorized redirect URIs**:

| Environment | Redirect URI |
|-------------|--------------|
| Firebase Auth Handler | `https://pearto-app.firebaseapp.com/__/auth/handler` |
| Local Development | `http://localhost:3000/__/auth/handler` |
| Local Callback | `http://localhost:3000/auth/callback` |
| Production (if applicable) | `https://pearto.com/__/auth/handler` |

### 3. Environment Variables
Ensure `.env.local` has these values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAQVPecT36Q7QNhUrj2C_x9qebABgFkBhI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pearto-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pearto-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pearto-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=598973425153
NEXT_PUBLIC_FIREBASE_APP_ID=1:598973425153:web:c5584bec2ebce0a4710200
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-L0B6CD6ECV
```

## OAuth Flow

1. **Popup Flow** (default): Opens Google sign-in in popup window
2. **Redirect Flow** (fallback): Redirects to Google, then back to `/auth/callback`

The app automatically falls back to redirect if popup is blocked.
