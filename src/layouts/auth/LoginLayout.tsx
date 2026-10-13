import type { ReactNode } from 'react';

type Props = { children: ReactNode };

export default function LoginLayout({ children }: Props) {
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
          {children}
        </div>
      </section>
    </main>
  );
}
