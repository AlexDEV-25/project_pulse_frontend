import { useState, type FormEventHandler } from 'react';

type Props = {
  email: string;
  password: string;
  busy: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onGoogleLogin: () => void;
};

export default function LoginLayout({
  email,
  password,
  busy,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleLogin,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <main className="login-page">
      <section className="login-card login-split-card">
        <div className="login-visual">
          <img src="/images/login.png" alt="Project Pulse" />
        </div>
        <div className="login-form-panel">
          <div className="login-form-heading">
            <span className="login-mark">P</span>
            <div>
              <strong>Project Pulse</strong>
              <small>PROJECT MANAGEMENT</small>
            </div>
          </div>
          <h2>Đăng nhập</h2>
          <p className="login-subtitle">Chào mừng bạn quay trở lại!</p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={onSubmit}>
            <label htmlFor="email">Email</label>
            <input
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
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            <div className="forgot-link">Quên mật khẩu?</div>
            <button type="submit" disabled={busy}>
              {busy ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>
          <div className="login-separator">
            <span>hoặc</span>
          </div>
          <button
            className="google"
            type="button"
            onClick={onGoogleLogin}
            disabled={busy}
          >
            <span className="google-g">G</span>Đăng nhập với Google
          </button>
          <p className="login-footer">
            Chưa có tài khoản? <span>Liên hệ quản trị viên</span>
          </p>
        </div>
      </section>
    </main>
  );
}
