import { useState } from 'react';

export default function AdminLoginPage({ onAdminLogin, onBack }) {
  const [username, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    onAdminLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded-lg w-96 shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

        <input
          className="w-full p-2 mb-4 rounded bg-slate-700"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 mb-6 rounded bg-slate-700"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-red-600 hover:bg-red-700 p-2 rounded">
          Login as Admin
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full mt-4 text-sm text-gray-400 hover:text-gray-200"
        >
          Back
        </button>
      </form>
    </div>
  );
}
