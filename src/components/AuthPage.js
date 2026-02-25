import { useState } from 'react';
import { ArrowLeft, User, Lock, Sword, BookOpen, Mail } from 'lucide-react';
import { API_URL } from '../api';



export default function AuthPage({ role, onAuth, onBack, }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState('identifier');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotInfo, setForgotInfo] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);

  const postForgotPassword = async (identifier, timeoutMs = 120000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('Request timeout'), timeoutMs);
    try {
      let res;
      try {
        res = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier }),
          signal: controller.signal
        });
      } catch (err) {
        if (controller.signal.aborted) {
          throw new Error('Request timed out while contacting server.');
        }
        throw err;
      }
      if (!res.ok) {
        throw new Error(`Forgot-password failed with status ${res.status}`);
      }
      return true;
    } finally {
      clearTimeout(timeout);
    }
  };

  const postResetPassword = async (otp, newPassword, timeoutMs = 30000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('Request timeout'), timeoutMs);
    try {
      let res;
      try {
        res = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp, newPassword }),
          signal: controller.signal
        });
      } catch (err) {
        if (controller.signal.aborted) {
          throw new Error('Request timed out. Please try again.');
        }
        throw err;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Reset failed with status ${res.status}`);
      }
      return data;
    } finally {
      clearTimeout(timeout);
    }
  };

  const openForgotModal = () => {
    setForgotOpen(true);
    setForgotStep('identifier');
    setForgotIdentifier('');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotInfo('');
    setForgotError('');
    setForgotBusy(false);
  };

  const handleSendResetCode = () => {
    const identifier = forgotIdentifier.trim();
    if (!identifier) {
      setForgotError('Please enter your email or username.');
      return;
    }

    setForgotError('');
    setForgotInfo('If an account exists, a reset code will be sent. It may take up to 1-2 minutes.');
    setForgotStep('code');
    setForgotBusy(true);

    postForgotPassword(identifier)
      .catch((err) => {
        console.error('Forgot password request failed:', err.message);
        setForgotError('Could not contact server. Please try again.');
      })
      .finally(() => setForgotBusy(false));
  };

  const handleResetWithOtp = async () => {
    try {
      const otp = forgotOtp.trim();
      const newPassword = forgotNewPassword.trim();

      if (!otp) {
        setForgotError('Please enter the 6-digit code.');
        return;
      }
      if (newPassword.length < 8) {
        setForgotError('Password must be at least 8 characters.');
        return;
      }

      setForgotBusy(true);
      setForgotError('');
      await postResetPassword(otp, newPassword);
      setForgotInfo('Password reset successful. You can sign in now.');
      setForgotStep('done');
    } catch (err) {
      console.error('Reset password request failed:', err.message);
      setForgotError(err.message || 'Reset failed. Please try again.');
    } finally {
      setForgotBusy(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim() || (isSignUp && !email.trim())
    ) {
      alert('Please fill in all fields');
      return;
    }


    setAuthBusy(true);
    try {
      //console.log('Submitting:', { username, password, isSignUp, email, role });
      await onAuth(username, password, isSignUp, email, role);
    } finally {
      setAuthBusy(false);
    }


  };


  const roleColor = role === 'student' ? 'blue' : 'amber';
  const RoleIcon = role === 'student' ? Sword : BookOpen;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Role Selection
      </button>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-full bg-${roleColor}-500 flex items-center justify-center shadow-lg`}>
              <RoleIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl mb-2 text-amber-400">{role === 'student' ? 'Student' : 'Teacher'} Portal</h1>
          <p className="text-purple-200">
            {isSignUp ? 'Create your account to begin your journey' : 'Welcome back, adventurer'}
          </p>
        </div>

        <div className={`bg-gradient-to-br from-${roleColor}-600/20 to-purple-800/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-${roleColor}-400/30 shadow-2xl`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-purple-100 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg pl-12 pr-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {isSignUp && ( // Show email input only during sign-up
              <div>
                <label className="block text-purple-100 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg pl-12 pr-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}




            <div>
              <label className="block text-purple-100 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg pl-12 pr-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="mt-2 text-sm text-purple-200 hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={authBusy}
              className={`w-full bg-gradient-to-r from-${roleColor}-600 to-${roleColor}-700 hover:from-${roleColor}-700 hover:to-${roleColor}-800 text-white py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-${roleColor}-500/50 transform hover:scale-105`}
            >
              {authBusy
                ? (isSignUp ? 'Creating Account...' : 'Signing In...')
                : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-200 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-blue-400/30 bg-slate-900/95 p-6 shadow-2xl">
            <h2 className="mb-2 text-2xl text-amber-400">Reset Password</h2>
            <p className="mb-4 text-sm text-purple-200">Use your email/username and 6-digit code.</p>

            {forgotStep === 'identifier' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full rounded-lg border-2 border-purple-400/30 bg-slate-800/50 px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  placeholder="Email or username"
                />
                <button
                  type="button"
                  onClick={handleSendResetCode}
                  className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:opacity-70"
                  disabled={forgotBusy}
                >
                  {forgotBusy ? 'Sending...' : 'Send Reset Code'}
                </button>
              </div>
            )}

            {forgotStep === 'code' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  className="w-full rounded-lg border-2 border-purple-400/30 bg-slate-800/50 px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  placeholder="6-digit code"
                />
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full rounded-lg border-2 border-purple-400/30 bg-slate-800/50 px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  placeholder="New password (min 8 chars)"
                />
                <button
                  type="button"
                  onClick={handleResetWithOtp}
                  className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:opacity-70"
                  disabled={forgotBusy}
                >
                  {forgotBusy ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}

            {forgotStep === 'done' && (
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
              >
                Close
              </button>
            )}

            {forgotInfo && <p className="mt-4 text-sm text-blue-300">{forgotInfo}</p>}
            {forgotError && <p className="mt-2 text-sm text-red-300">{forgotError}</p>}

            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="mt-4 text-sm text-purple-200 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {authBusy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="rounded-2xl border border-amber-400/30 bg-slate-900/95 px-8 py-6 text-center shadow-2xl">
            <div className="text-2xl text-amber-400 font-semibold mb-2">
              {isSignUp ? 'Creating Account' : 'Signing In'}
            </div>
            <div className="text-purple-200">Please wait...</div>
          </div>
        </div>
      )}
    </div>
  );
}
