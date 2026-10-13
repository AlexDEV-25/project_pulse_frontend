import { useEffect, useState } from 'react';
import {
  login,
  loginWithGoogle,
  selectGoogleRole,
  selectRole,
} from '@/apis/AuthApi';
import { getApiErrorMessage } from '@/apis/HttpClient';
import { OAuthConfig } from '@/configurations/configuration';
import LoginLayout from './auth/LoginLayout';
import DashboardPage from './dashboard/DashboardPage';
import type { DashboardRole } from './common/components/navigation/Sidebar';
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import ChangePassword from './auth/ChangePassword';
import { useAuth } from '@/hooks/useAuth';

const readSessionRoles = (): string[] => {
  try {
    const value = JSON.parse(localStorage.getItem('roles') ?? '[]');
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

const saveSession = (
  token: string,
  roles: string[],
  selectedRole: string
): DashboardRole => {
  if (!['ADMIN', 'PM', 'EMPLOYEE'].includes(selectedRole)) {
    throw new Error('Role được chọn không hợp lệ.');
  }
  localStorage.setItem('token', token);
  localStorage.setItem('roles', JSON.stringify(roles));
  localStorage.setItem('role', selectedRole);
  return selectedRole as DashboardRole;
};

export default function ApplicationLayout() {
  const [token, setToken] = useState(() => localStorage.getItem('token') ?? '');
  const [roles, setRoles] = useState<string[]>(readSessionRoles);
  const [role, setRole] = useState<DashboardRole | ''>(
    () => (localStorage.getItem('role') as DashboardRole | null) ?? ''
  );
  const [pendingRoles, setPendingRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [pendingGoogleCode, setPendingGoogleCode] = useState<string | null>(
    null
  );
  const [busy, setBusy] = useState(() =>
    new URLSearchParams(window.location.search).has('code')
  );
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authPath, setAuthPath] = useState(() => window.location.pathname);

  const goTo = (path: string) => {
    window.history.pushState({}, '', path);
    setAuthPath(path);
  };

  const beginRoleSelection = (
    availableRoles: string[],
    googleCode: string | null = null
  ) => {
    if (availableRoles.length === 0)
      throw new Error('Tài khoản chưa được cấp role.');
    setPendingRoles(availableRoles);
    setSelectedRole('');
    setPendingGoogleCode(googleCode);
  };

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) return;
    window.history.replaceState({}, document.title, window.location.pathname);
    loginWithGoogle(code)
      .then((response) => {
        const auth = response.result;
        if (!auth) throw new Error('API không trả về thông tin role.');
        beginRoleSelection(auth.roles ?? [], code);
      })
      .catch((requestError: unknown) =>
        setError(getApiErrorMessage(requestError))
      )
      .finally(() => setBusy(false));
  }, []);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await login({ email, password });
      const auth = response.result;
      if (!auth) throw new Error('API không trả về thông tin role.');
      beginRoleSelection(auth.roles ?? []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const confirmRole = async () => {
    if (!selectedRole) return;
    setBusy(true);
    setError('');
    try {
      const response = pendingGoogleCode
        ? await selectGoogleRole({
            code: pendingGoogleCode,
            role: selectedRole,
          })
        : await selectRole({ email, password, role: selectedRole });
      const auth = response.result;
      if (!auth?.token)
        throw new Error('API không trả về token cho role đã chọn.');
      const nextRole = saveSession(
        auth.token,
        auth.roles ?? pendingRoles,
        selectedRole
      );
      setRoles(auth.roles ?? pendingRoles);
      setRole(nextRole);
      setToken(auth.token);
      setPendingRoles([]);
      setPendingGoogleCode(null);
      setSelectedRole('');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const cancelRoleSelection = () => {
    setPendingRoles([]);
    setPendingGoogleCode(null);
    setSelectedRole('');
    setError('');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('roles');
    setToken('');
    setRoles([]);
    setRole('');
    setPendingRoles([]);
    setEmail('');
    setPassword('');
  };

  useEffect(() => {
    const onTokenRefreshed = () =>
      setToken(localStorage.getItem('token') ?? '');
    const onExpired = () => logout();
    window.addEventListener('auth:token-refreshed', onTokenRefreshed);
    window.addEventListener('auth:expired', onExpired);
    return () => {
      window.removeEventListener('auth:token-refreshed', onTokenRefreshed);
      window.removeEventListener('auth:expired', onExpired);
    };
  }, []);

  useAuth();

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

  // The backend puts this exact path in the password-reset email.
  const resetMatch = authPath.match(/^\/change-password\/([^/]+)$/);

  if (token && role) return <DashboardPage role={role} onLogout={logout} />;
  if (token && roles.length === 0)
    return <div className="auth-loading">Đang kiểm tra quyền truy cập...</div>;

  const authContent = resetMatch ? (
    <ChangePassword
      code={decodeURIComponent(resetMatch[1])}
      onBack={() => goTo('/')}
      onDone={() => goTo('/')}
    />
  ) : authPath === '/forgot-password' ? (
    <ForgotPassword onBack={() => goTo('/')} />
  ) : (
    <Login
      email={email}
      password={password}
      busy={busy}
      error={error}
      availableRoles={pendingRoles}
      selectedRole={selectedRole}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onLogin={() => void submit()}
      onGoogleLogin={googleLogin}
      onForgotPassword={() => goTo('/forgot-password')}
      onRoleChange={setSelectedRole}
      onRoleSubmit={() => void confirmRole()}
      onRoleCancel={cancelRoleSelection}
    />
  );

  return <LoginLayout>{authContent}</LoginLayout>;
}
