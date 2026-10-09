import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { changePassword } from '../apis/AuthApi';
import { getMyInfo, updateAvatar } from '../apis/UserApi';
import type { UserResponse } from '../dto/response';
import { DashboardFrame } from './EmployeeDashboard';
import type { DashboardRole } from './components/Sidebar';
import './settings.css';

export default function Settings({
  role,
  onLogout,
  onMenuChange,
}: {
  role: DashboardRole;
  onLogout: () => void;
  onMenuChange: (label: string) => void;
}) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void getMyInfo()
      .then((response) => setUser(response.result))
      .catch(() => setError('Không thể tải thông tin cá nhân.'))
      .finally(() => setLoading(false));
  }, []);

  const selectAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn một tệp hình ảnh.');
      return;
    }
    setError('');
    setMessage('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const response = await updateAvatar(avatarFile);
      if (response.result) setUser(response.result);
      setAvatarFile(null);
      setAvatarPreview('');
      setMessage('Đã cập nhật ảnh đại diện.');
    } catch {
      setError('Không thể cập nhật ảnh đại diện.');
    } finally {
      setUploading(false);
    }
  };

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (passwords.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setChangingPassword(true);
    setError('');
    setMessage('');
    try {
      await changePassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Đã đổi mật khẩu thành công.');
    } catch {
      setError('Không thể đổi mật khẩu. Hãy kiểm tra mật khẩu hiện tại.');
    } finally {
      setChangingPassword(false);
    }
  };

  const avatar = avatarPreview || user?.avatarUrl;
  return (
    <DashboardFrame role={role} onLogout={onLogout} activeMenu="Cài đặt" onMenuChange={onMenuChange}>
      <div className="settings-page">
        <header className="settings-header"><div><p>Cá nhân</p><h1>Cài đặt tài khoản</h1><span>Quản lý thông tin và bảo mật tài khoản của bạn</span></div></header>
        {message && <div className="settings-message">{message}</div>}
        {error && <div className="settings-error">{error}</div>}
        {loading ? <div className="settings-state">Đang tải thông tin cá nhân...</div> : <div className="settings-grid">
          <section className="settings-card settings-profile-card">
            <h2>Thông tin cá nhân</h2>
            <div className="settings-profile-top">
              {avatar ? <img src={avatar} alt={user?.userName || 'Ảnh đại diện'} /> : <span>{user?.userName?.slice(0, 2).toUpperCase() || 'U'}</span>}
              <div><h3>{user?.userName || 'Chưa cập nhật'}</h3><p>{role}</p></div>
            </div>
            <div className="settings-info-list">
              <div><span>Email</span><strong>{user?.email || 'Chưa cập nhật'}</strong></div>
              <div><span>Chức vụ</span><strong>{user?.position || 'Chưa cập nhật'}</strong></div>
              <div><span>Phòng ban</span><strong>{user?.departmentName || 'Chưa cập nhật'}</strong></div>
              <div><span>Resource rate</span><strong>{user?.resourceRate ?? 'Chưa cập nhật'}</strong></div>
            </div>
          </section>
          <section className="settings-card">
            <h2>Ảnh đại diện</h2>
            <p className="settings-help">Chọn ảnh mới để cập nhật ảnh đại diện của bạn.</p>
            <label className="settings-file-button">Chọn ảnh<input type="file" accept="image/*" onChange={selectAvatar} /></label>
            {avatarFile && <p className="settings-file-name">{avatarFile.name}</p>}
            <button className="settings-primary" type="button" onClick={() => void saveAvatar()} disabled={!avatarFile || uploading}>{uploading ? 'Đang cập nhật...' : 'Lưu ảnh đại diện'}</button>
          </section>
          <section className="settings-card settings-password-card">
            <h2>Đổi mật khẩu</h2>
            <p className="settings-help">Sử dụng mật khẩu mới để bảo vệ tài khoản của bạn.</p>
            <form onSubmit={submitPassword}>
              <label>Mật khẩu hiện tại<input type="password" value={passwords.oldPassword} onChange={(event) => setPasswords({ ...passwords, oldPassword: event.target.value })} required /></label>
              <label>Mật khẩu mới<input type="password" minLength={6} value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} required /></label>
              <label>Xác nhận mật khẩu mới<input type="password" minLength={6} value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} required /></label>
              <button className="settings-primary" type="submit" disabled={changingPassword}>{changingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</button>
            </form>
          </section>
        </div>}
      </div>
    </DashboardFrame>
  );
}
