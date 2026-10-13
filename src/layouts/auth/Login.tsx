import { useState } from 'react';
import Button from '@/layouts/common/components/ui/Button';
import Input from '@/layouts/common/components/ui/Input';
import Select from '@/layouts/common/components/ui/Select';

type Props = {
  email: string;
  password: string;
  busy: boolean;
  error: string;
  availableRoles: string[];
  selectedRole: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
  onGoogleLogin: () => void;
  onForgotPassword: () => void;
  onRoleChange: (value: string) => void;
  onRoleSubmit: () => void;
  onRoleCancel: () => void;
};

export default function Login({
  email,
  password,
  busy,
  error,
  availableRoles,
  selectedRole,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onGoogleLogin,
  onForgotPassword,
  onRoleChange,
  onRoleSubmit,
  onRoleCancel,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <h2>Đăng nhập</h2>
      <p className="login-subtitle">Chào mừng bạn quay trở lại!</p>
      {error && <div className="login-error">{error}</div>}
      {availableRoles.length > 0 ? (
        <div className="role-selection">
          <p>Hãy chọn role muốn sử dụng:</p>
          <label htmlFor="login-role">Role</label>
          <Select
            id="login-role"
            value={selectedRole}
            onChange={(event) => onRoleChange(event.target.value)}
            disabled={busy}
          >
            <option value="">Chọn role</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
          <Button
            variant="success"
            block
            type="button"
            disabled={busy || !selectedRole}
            onClick={onRoleSubmit}
          >
            {busy ? 'Đang xác nhận...' : 'Tiếp tục với role này'}
          </Button>
          <Button
            variant="outline-success"
            block
            type="button"
            disabled={busy}
            onClick={onRoleCancel}
          >
            Quay lại đăng nhập
          </Button>
        </div>
      ) : (
        <div>
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="example@gmail.com"
            autoComplete="email"
            required
          />
          <label htmlFor="password">Mật khẩu</label>
          <div className="password-wrap">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              required
            />
            <Button
              variant="link"
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {showPassword ? (
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Zm9.5-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                ) : (
                  <path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.2 17.2 0 0 1-3.1 3.6M6.2 6.2C3.7 8 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.5" />
                )}
              </svg>
            </Button>
          </div>
          <button
            type="button"
            className="forgot-link"
            onClick={onForgotPassword}
          >
            Quên mật khẩu?
          </button>
          <Button
            variant="success"
            block
            type="button"
            onClick={onLogin}
            disabled={busy || !email.trim() || !password}
          >
            {busy ? 'Đang xác thực...' : 'Đăng nhập'}
          </Button>
        </div>
      )}
      <div className="login-separator">
        <span>hoặc</span>
      </div>
      <Button
        variant="outline-secondary"
        block
        className="google"
        type="button"
        onClick={onGoogleLogin}
        disabled={busy}
      >
        <span className="google-g">G</span>Đăng nhập với Google
      </Button>
      <p className="login-footer">
        Chưa có tài khoản? <span>Liên hệ quản trị viên</span>
      </p>
    </>
  );
}
