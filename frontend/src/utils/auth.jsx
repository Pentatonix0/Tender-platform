import { createAsyncAuthProvider } from 'react-token-auth';

// Убираем типизацию Session
export const { useAuth, authFetch, login, logout } = createAsyncAuthProvider({
    accessTokenKey: 'access_token',
    accessTokenExpireKey: 'exp',
    storage: localStorage,
    onUpdateToken: (token) =>
        fetch('api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.refresh_token}`,
            },
        })
            .then((r) => r.json())
            .then(console.log('refr'))
            .catch((err) => {
                console.error('Token Refresh error:', err);
            }),
});
