import { useState } from 'react';
import { resetPassword } from '@/apis/AuthApi';
import { getApiErrorMessage } from '@/apis/HttpClient';
import type { ForgotPasswordRequest } from '@/dto/request';
import Button from '@/layouts/common/components/ui/Button';
import Input from '@/layouts/common/components/ui/Input';

type Props = {
  code: string;
  onBack: () => void;
  onDone: () => void;
};

export default function ChangePassword({ code, onBack, onDone }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (password.length < 8 || password !== confirmPassword) {
      setSuccess(false);
      setMessage('Mật khẩu phải có ít nhất 8 ký tự và hai ô phải trùng nhau.');
      return;
    }
    setLoading(true);
    setMessage('');
    const data: ForgotPasswordRequest = {
      email,
      forgotPasswordCode: code,
      password,
    };
    try {
      await resetPassword(data);
      setSuccess(true);
      setMessage('Đặt lại mật khẩu thành công. Hãy đăng nhập lại.');
      window.setTimeout(onDone, 1200);
    } catch (error) {
      setSuccess(false);
      setMessage(
        getApiErrorMessage(
          error,
          'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Đặt lại mật khẩu</h2>
      <p className="login-subtitle">
        Tạo mật khẩu mới cho {email || 'tài khoản của bạn'}.
      </p>
      <div>
        <label htmlFor="reset-email">Email</label>
        <Input
          id="reset-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="example@gmail.com"
          autoComplete="email"
          required
        />
        <label htmlFor="new-password">Mật khẩu mới</label>
        <div className="password-wrap">
          <Input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <Button
            variant="link"
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Zm9.5-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>
          </Button>
        </div>
        <label htmlFor="confirm-password">Nhập lại mật khẩu</label>
        <div className="password-wrap">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <Button
            variant="link"
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword((value) => !value)}
            aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Zm9.5-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>
          </Button>
        </div>
        <Button
          variant="success"
          block
          type="button"
          onClick={() => void submit()}
          disabled={
            loading || !email.trim() || !password || !confirmPassword
          }
        >
          {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
        </Button>
      </div>
      {message && (
        <p className={success ? 'auth-success' : 'login-error'}>{message}</p>
      )}
      <button type="button" className="auth-link-button" onClick={onBack}>
        Quay lại đăng nhập
      </button>
    </>
  );
}
