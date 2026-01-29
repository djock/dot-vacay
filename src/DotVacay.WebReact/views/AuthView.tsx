import React, { useState } from 'react';
import Logo from '../components/Logo';

interface AuthViewProps {
  onAuth: (mode: 'login' | 'register', email: string, password: string) => void;
  loading?: boolean;
  error?: string | null;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuth, loading, error }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onAuth(isLogin ? 'login' : 'register', email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-600 p-4 -m-4 md:-m-8">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-10">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-800">DotVacay</h1>
          <p className="text-slate-500 mt-2">Plan your next adventure with ease</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-4 rounded-xl font-bold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/20 active:scale-95 transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
          {error && (
            <p className="text-sm text-red-100 bg-red-500/80 px-3 py-2 rounded-xl">{error}</p>
          )}
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-slate-500">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sky-600 font-bold hover:underline"
              type="button"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Or continue with</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-2 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-colors" type="button">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-colors" type="button">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
