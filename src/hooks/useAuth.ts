import { useEffect } from 'react';
import { introspect, refreshToken } from '../apis/AuthApi';
import type { TokenRequest } from '../dto/request';

export const useAuth = () => {
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    const checkToken = async () => {
      try {
        await introspect({ token } satisfies TokenRequest);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('roles');
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    };

    void checkToken();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const interval = window.setInterval(
      async () => {
        try {
          const currentToken = localStorage.getItem('token') ?? token;
          const response = await refreshToken({ token: currentToken });
          const nextToken = response.result?.token;
          if (!nextToken) throw new Error('Refresh response has no token.');
          localStorage.setItem('token', nextToken);
          window.dispatchEvent(new CustomEvent('auth:token-refreshed'));
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('roles');
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      },
      15 * 60 * 1000
    );

    return () => window.clearInterval(interval);
  }, [token]);
};
