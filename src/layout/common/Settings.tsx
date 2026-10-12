import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { changePassword } from '../../apis/AuthApi';
import { getMyInfo, updateAvatar } from '../../apis/UserApi';
import type { UserResponse } from '../../dto/response';
import { DashboardFrame } from '../employee/EmployeeDashboard';
import type { DashboardRole } from '../components/Sidebar';

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
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [visiblePasswords, setVisiblePasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
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
      await changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Đã đổi mật khẩu thành công.');
    } catch {
      setError('Không thể đổi mật khẩu. Hãy kiểm tra mật khẩu hiện tại.');
    } finally {
      setChangingPassword(false);
    }
  };

  const avatar = avatarPreview || user?.avatarUrl;
  const togglePassword = (field: keyof typeof visiblePasswords) =>
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  const cancelAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
  };
  const eyeIcon = (visible: boolean) => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {visible ? (
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Zm9.5-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      ) : (
        <path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.2 17.2 0 0 1-3.1 3.6M6.2 6.2C3.7 8 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.5" />
      )}
    </svg>
  );
  return (
    <DashboardFrame
      role={role}
      onLogout={onLogout}
      activeMenu="Cài đặt"
      onMenuChange={onMenuChange}
    >
      <div className="settings-page">
        <header className="settings-header">
          <div>
            <p>Cá nhân</p>
            <h1>Cài đặt tài khoản</h1>
            <span>Quản lý thông tin và bảo mật tài khoản của bạn</span>
          </div>
        </header>
        {message && <div className="settings-message">{message}</div>}
        {error && <div className="settings-error">{error}</div>}
        {loading ? (
          <div className="settings-state">Đang tải thông tin cá nhân...</div>
        ) : (
          <div className="settings-grid">
            <section className="settings-card settings-avatar-card">
              <h2>Ảnh đại diện</h2>
              <p className="settings-help">
                Chọn ảnh mới để cập nhật ảnh đại diện của bạn.
              </p>
              <label className="settings-avatar-preview">
                {avatar ? (
                  <img src={avatar} alt={user?.userName || 'Ảnh đại diện'} />
                ) : (
                  <span>
                    {user?.userName?.slice(0, 2).toUpperCase() || 'U'}
                  </span>
                )}
                <span className="settings-camera" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 7h3l1.4-2h5.2L16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm7 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
                  </svg>
                </span>
                <input type="file" accept="image/*" onChange={selectAvatar} />
              </label>
              {avatarFile && (
                <p className="settings-file-name">{avatarFile.name}</p>
              )}
              <div className="settings-avatar-actions">
                <button
                  className="settings-cancel"
                  type="button"
                  onClick={cancelAvatar}
                  disabled={!avatarFile || uploading}
                >
                  Hủy
                </button>
                <button
                  className="settings-primary"
                  type="button"
                  onClick={() => void saveAvatar()}
                  disabled={!avatarFile || uploading}
                >
                  {uploading ? 'Đang cập nhật...' : '✓  Lưu ảnh đại diện'}
                </button>
              </div>
            </section>
            <section className="settings-card settings-profile-card">
              <h2>Thông tin cá nhân</h2>
              <div className="settings-profile-top">
                {avatar ? (
                  <img src={avatar} alt={user?.userName || 'Ảnh đại diện'} />
                ) : (
                  <span>
                    {user?.userName?.slice(0, 2).toUpperCase() || 'U'}
                  </span>
                )}
                <div>
                  <h3>{user?.userName || 'Chưa cập nhật'}</h3>
                  <p>{role}</p>
                </div>
              </div>
              <div className="settings-info-list">
                <div>
                  <span>
                    <i className="settings-info-icon email" />
                    Email
                  </span>
                  <strong>{user?.email || 'Chưa cập nhật'}</strong>
                </div>
                <div>
                  <span>
                    <i className="settings-info-icon briefcase" />
                    Chức vụ
                  </span>
                  <strong>{user?.position || 'Chưa cập nhật'}</strong>
                </div>
                <div>
                  <span>
                    <i className="settings-info-icon building" />
                    Phòng ban
                  </span>
                  <strong>{user?.departmentName || 'Chưa cập nhật'}</strong>
                </div>
                <div>
                  <span>
                    <i className="settings-info-icon rate" />
                    Resource rate
                  </span>
                  <strong>{user?.resourceRate ?? 'Chưa cập nhật'}</strong>
                </div>
              </div>
            </section>
            <section className="settings-card settings-password-card">
              <h2>Đổi mật khẩu</h2>
              <p className="settings-help">
                Sử dụng mật khẩu mới để bảo vệ tài khoản của bạn.
              </p>
              <form onSubmit={submitPassword}>
                {(
                  ['oldPassword', 'newPassword', 'confirmPassword'] as const
                ).map((field, index) => {
                  const labels = [
                    'Mật khẩu hiện tại',
                    'Mật khẩu mới',
                    'Xác nhận mật khẩu mới',
                  ];
                  return (
                    <label key={field}>
                      {labels[index]}
                      <span className="settings-password-input">
                        <input
                          type={visiblePasswords[field] ? 'text' : 'password'}
                          minLength={index > 0 ? 6 : undefined}
                          value={passwords[field]}
                          onChange={(event) =>
                            setPasswords({
                              ...passwords,
                              [field]: event.target.value,
                            })
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePassword(field)}
                          aria-label={
                            visiblePasswords[field]
                              ? 'Ẩn mật khẩu'
                              : 'Hiện mật khẩu'
                          }
                        >
                          {eyeIcon(visiblePasswords[field])}
                        </button>
                      </span>
                    </label>
                  );
                })}
                <button
                  className="settings-primary"
                  type="submit"
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </DashboardFrame>
  );
}
