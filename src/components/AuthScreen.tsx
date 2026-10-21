import { useState } from 'react';
import { useStore } from '../store';

type Mode = 'login' | 'register';

export function AuthScreen() {
  const login = useStore((s) => s.login);
  const register = useStore((s) => s.register);
  const busy = useStore((s) => s.busy);

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, name.trim() || undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-sub">Your resumes are saved to the cloud and available anywhere you sign in.</p>

        {mode === 'register' && (
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" autoComplete="name" /></label>
        )}
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} /></label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="primary-button" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <button type="button" className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}>
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
        </button>
      </form>
    </main>
  );
}
