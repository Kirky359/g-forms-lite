import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { isValidEmail } from '@forms/shared';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthPage.module.scss';

const GENERIC_ERROR = 'Invalid email or password. Please try again or reset your password.';
const GOOGLE_METHOD_ERROR = 'To secure your account, please sign in with the original method (Google).';
const EMAIL_EXISTS_ERROR = 'An account with this email already exists. Try signing in instead.';
const EMAIL_EXISTS_GOOGLE_ERROR = 'This email is linked to a Google account. Use "Continue with Google" to sign in.';

const MIN_PASSWORD_LENGTH = 6;

function validateEmail(value: string): string | null {
  if (!value) return 'Email is required.';
  if (!isValidEmail(value)) return 'Enter a valid email address.';
  return null;
}

function validatePassword(value: string): string | null {
  if (!value) return 'Password is required.';
  if (value.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

type Tab = 'signin' | 'register';

export function AuthPage() {
  const { user, checkMethods, signIn, signUp, signInWithGoogle, signInAnonymously } = useAuth();

  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(validateEmail(e.target.value));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(validatePassword(e.target.value));
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setEmailError(null);
    setPasswordError(null);
    setSubmitError(null);
  };

  // ── Sign in ──
  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    if (eErr) setEmailError(eErr);
    if (pErr) setPasswordError(pErr);
    if (eErr || pErr) return;

    setEmailError(null);
    setPasswordError(null);
    setSubmitError(null);
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch {
      // Only after a failed attempt do we check the provider — this makes
      // bulk enumeration slow (costs one full auth round-trip per probe).
      try {
        const methods = await checkMethods(email);
        if (methods.includes('google') && !methods.includes('password')) {
          setSubmitError(GOOGLE_METHOD_ERROR);
        } else {
          setSubmitError(GENERIC_ERROR);
        }
      } catch {
        setSubmitError(GENERIC_ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register ──
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    if (eErr) setEmailError(eErr);
    if (pErr) setPasswordError(pErr);
    if (eErr || pErr) return;

    setEmailError(null);
    setPasswordError(null);
    setSubmitError(null);
    setIsLoading(true);
    try {
      await signUp(email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        try {
          const methods = await checkMethods(email);
          if (methods.includes('google') && !methods.includes('password')) {
            setSubmitError(EMAIL_EXISTS_GOOGLE_ERROR);
          } else {
            setSubmitError(EMAIL_EXISTS_ERROR);
          }
        } catch {
          setSubmitError(EMAIL_EXISTS_ERROR);
        }
      } else {
        setSubmitError(GENERIC_ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setSubmitError(GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setSubmitError(null);
    setIsLoading(true);
    try {
      await signInAnonymously();
    } catch {
      setSubmitError(GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleButton = () => (
    <button
      type="button"
      className={styles.authPage__googleButton}
      onClick={handleGoogle}
      disabled={isLoading}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
      Continue with Google
    </button>
  );

  return (
    <div className={styles.authPage}>
      <div className={styles.authPage__card}>
        <h1 className={styles.authPage__title}>Forms Lite</h1>

        <div className={styles.authPage__tabs}>
          <button
            type="button"
            className={`${styles.authPage__tab} ${tab === 'signin' ? styles['authPage__tab--active'] : ''}`}
            onClick={() => switchTab('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.authPage__tab} ${tab === 'register' ? styles['authPage__tab--active'] : ''}`}
            onClick={() => switchTab('register')}
          >
            Register
          </button>
        </div>

        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className={styles.authPage__form} noValidate>
            <div className={styles.authPage__field}>
              <label htmlFor="email" className={styles.authPage__label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                className={`${styles.authPage__input} ${emailError ? styles['authPage__input--error'] : ''}`}
                autoComplete="email"
                autoFocus
              />
              {emailError && <span className={styles.authPage__fieldError}>{emailError}</span>}
            </div>

            <div className={styles.authPage__field}>
              <label htmlFor="password" className={styles.authPage__label}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className={`${styles.authPage__input} ${passwordError ? styles['authPage__input--error'] : ''}`}
                autoComplete="current-password"
              />
              {passwordError && <span className={styles.authPage__fieldError}>{passwordError}</span>}
            </div>

            {submitError && <p className={styles.authPage__error}>{submitError}</p>}

            <button type="submit" className={styles.authPage__submit} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className={styles.authPage__divider}><span>or</span></div>

            <div className={styles.authPage__socialButtons}>
              <GoogleButton />
              <p className={styles.authPage__googleHint}>
                If you have an account, you can also sign in with Google.
              </p>
              <button
                type="button"
                className={styles.authPage__anonymousButton}
                onClick={handleAnonymous}
                disabled={isLoading}
              >
                Continue as Guest
              </button>
            </div>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className={styles.authPage__form} noValidate>
            <div className={styles.authPage__field}>
              <label htmlFor="reg-email" className={styles.authPage__label}>Email</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                className={`${styles.authPage__input} ${emailError ? styles['authPage__input--error'] : ''}`}
                autoComplete="email"
                autoFocus
              />
              {emailError && <span className={styles.authPage__fieldError}>{emailError}</span>}
            </div>

            <div className={styles.authPage__field}>
              <label htmlFor="reg-password" className={styles.authPage__label}>Password</label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className={`${styles.authPage__input} ${passwordError ? styles['authPage__input--error'] : ''}`}
                autoComplete="new-password"
              />
              {passwordError && <span className={styles.authPage__fieldError}>{passwordError}</span>}
            </div>

            {submitError && <p className={styles.authPage__error}>{submitError}</p>}

            <button type="submit" className={styles.authPage__submit} disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className={styles.authPage__divider}><span>or</span></div>

            <div className={styles.authPage__socialButtons}>
              <GoogleButton />
              <button
                type="button"
                className={styles.authPage__anonymousButton}
                onClick={handleAnonymous}
                disabled={isLoading}
              >
                Continue as Guest
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}