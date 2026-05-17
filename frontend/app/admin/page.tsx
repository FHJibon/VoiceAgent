'use client';

import { useState, useEffect, useCallback } from 'react';

type User = {
  id: number;
  name: string | null;
  phone: string | null;
  job_title: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [data, setData] = useState<{ users: User[], stats: any }>({ users: [], stats: null });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const getApiUrl = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || '';
    if (!wsUrl) {
      console.error('NEXT_PUBLIC_WS_URL is not set in frontend/.env!');
      return '';
    }
    return wsUrl.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '');
  };

  const fetchWithAuth = useCallback(async (endpoint: string, method: string = 'GET') => {
    const auth = btoa(`${credentials.username}:${credentials.password}`);
    const res = await fetch(`${getApiUrl()}${endpoint}`, {
      method,
      headers: { 'Authorization': `Basic ${auth}` }
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  }, [credentials]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const stats = await fetchWithAuth('/stats');
      const users = await fetchWithAuth('/users');
      setData({ users: users.users || [], stats });
      setIsAuthenticated(true);
    } catch (err) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetchWithAuth(`/users/${id}`, 'DELETE');
      setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center">Admin Console</h1>
          <div className="space-y-4">
            <input 
              type="text" placeholder="Username" required
              className="w-full p-4 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={e => setCredentials(p => ({ ...p, username: e.target.value }))}
            />
            <input 
              type="password" placeholder="Password" required
              className="w-full p-4 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={e => setCredentials(p => ({ ...p, password: e.target.value }))}
            />
            <button className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 transition-all">
              {loading ? 'Logging in...' : 'Enter Dashboard'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const filteredUsers = data.users.filter(u => 
    [u.name, u.phone, u.job_title].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold">Database</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm font-medium text-gray-400 hover:text-black">Logout</button>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-12">
          {['Total Users', 'Today', 'Sessions'].map((l, i) => (
            <div key={l} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{l}</p>
              <p className="text-3xl font-bold">{i === 0 ? data.stats?.total_users : i === 1 ? data.stats?.users_today : data.stats?.total_sessions}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <input 
              type="text" placeholder="Search..." 
              className="px-4 py-2 bg-gray-50 rounded-xl text-sm w-64 focus:outline-none"
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-8 py-4">Name</th>
                <th className="px-8 py-4">Phone</th>
                <th className="px-8 py-4">Job Title</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-6 font-medium">{user.name}</td>
                  <td className="px-8 py-6 text-gray-500">{user.phone}</td>
                  <td className="px-8 py-6 text-gray-500">{user.job_title}</td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => deleteUser(user.id)} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}