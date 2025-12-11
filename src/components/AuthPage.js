import { useState } from 'react';
import { ArrowLeft, User, Lock, Sword, BookOpen ,Mail} from 'lucide-react';



export default function AuthPage({ role, onAuth, onBack } ) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()|| (isSignUp && !email.trim())) {
      alert('Please fill in all fields');
      return;
    }

    onAuth(username, password, isSignUp, email);
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
            </div>

            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-${roleColor}-600 to-${roleColor}-700 hover:from-${roleColor}-700 hover:to-${roleColor}-800 text-white py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-${roleColor}-500/50 transform hover:scale-105`}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
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
    </div>
  );
}
