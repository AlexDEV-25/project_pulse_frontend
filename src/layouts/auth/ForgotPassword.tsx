import { useState } from 'react';
import { forgotPassword } from '@/apis/AuthApi';
import { getApiErrorMessage } from '@/apis/HttpClient';
import Button from '@/layouts/common/components/ui/Button';
import Input from '@/layouts/common/components/ui/Input';

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    setMessage('');
    try {
      await forgotPassword({ email: email.trim() });
      setSuccess(true);
      setMessage(
        'Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu.'
      );
    } catch (error) {
      setSuccess(false);
      setMessage(
        getApiErrorMessage(error, 'Không thể gửi yêu cầu đặt lại mật khẩu.')
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <h2>Quên mật khẩu</h2>
      <p className="login-subtitle">
        Nhập email để nhận liên kết đặt lại mật khẩu.
      </p>
      <div>
        <label htmlFor="forgot-email">Email</label>
        <Input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
        <Button
          variant="success"
          block
          type="button"
          onClick={() => void submit()}
          disabled={loading || !email.trim()}
        >
          {loading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
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
