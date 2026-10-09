import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { login, loginWithGoogle } from '../apis/AuthApi';
import { getMyInfo } from '../apis/UserApi';
import { OAuthConfig } from '../configurations/configuration';
import LoginLayout from './LoginLayout';
import DashboardPage from './DashboardPage';
import type { DashboardRole } from './components/Sidebar';

const errorText = (error: unknown) =>
  axios.isAxiosError<{ message?: string; error?: string }>(error)
    ? (error.response?.data?.message ??
      error.response?.data?.error ??
      error.message)
    : error instanceof Error
      ? error.message
      : 'Đã xảy ra lỗi. Vui lòng thử lại.';

export default function ApplicationLayout() {
  const [token, setToken] = useState(() => localStorage.getItem('token') ?? '');
  const [role, setRole] = useState<DashboardRole | ''>(() => (localStorage.getItem('role') as DashboardRole | null) ?? '');
  const [resolvingRole, setResolvingRole] = useState(() => Boolean(localStorage.getItem('token')));
  const [busy, setBusy] = useState(() =>
    new URLSearchParams(window.location.search).has('code')
  );
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!token) return;
    let active = true;
    setResolvingRole(true);
    void getMyInfo()
      .then((response) => {
        const roles = response.result?.roles.map((item) => item.name) ?? [];
        const nextRole: DashboardRole | '' = roles.includes('ADMIN')
          ? 'ADMIN'
          : roles.includes('PM')
            ? 'PM'
            : roles.includes('EMPLOYEE')
              ? 'EMPLOYEE'
              : '';
        if (!nextRole) throw new Error('Tài khoản chưa được cấp role hợp lệ.');
        if (!active) return;
        localStorage.setItem('role', nextRole);
        setRole(nextRole);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken('');
        setRole('');
        setError(errorText(requestError));
      })
      .finally(() => { if (active) setResolvingRole(false); });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) return;
    window.history.replaceState({}, document.title, window.location.pathname);
    loginWithGoogle(code)
      .then((response) => {
        const nextToken = response.result?.token;
        if (!nextToken) throw new Error('API không trả về token đăng nhập.');
        localStorage.setItem('token', nextToken);
        setRole('');
        setToken(nextToken);
      })
      .catch((requestError: unknown) => setError(errorText(requestError)))
      .finally(() => setBusy(false));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await login({ email, password });
      const nextToken = response.result?.token;
      if (!nextToken) throw new Error('API không trả về token đăng nhập.');
      localStorage.setItem('token', nextToken);
      setRole('');
      setToken(nextToken);
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken('');
    setRole('');
    setEmail('');
    setPassword('');
  };

  const googleLogin = () => {
    if (!OAuthConfig.clientId) {
      setError('Thiếu VITE_GOOGLE_CLIENT_ID trong file .env.');
      return;
    }
    const query = new URLSearchParams({
      client_id: OAuthConfig.clientId,
      redirect_uri: OAuthConfig.redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });
    window.location.assign(`${OAuthConfig.authUri}?${query.toString()}`);
  };

  if (token && role && !resolvingRole) {
    return <DashboardPage role={role} onLogout={logout} />;
  }

  if (token && resolvingRole) return <div className="auth-loading">Đang tải thông tin tài khoản...</div>;

  return (
    <LoginLayout
      email={email}
      password={password}
      busy={busy}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={submit}
      onGoogleLogin={googleLogin}
    />
  );
}
