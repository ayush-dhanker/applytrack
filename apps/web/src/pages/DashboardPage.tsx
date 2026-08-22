import { useAuth } from '../features/auth/AuthContext';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">ApplyTrack</h1>
        <button onClick={logout} className="text-sm underline">
          Sign out
        </button>
      </div>
      <p>Signed in as {user?.name} ({user?.email})</p>
      <p className="text-slate-500 mt-2">Applications coming in phase 2.</p>
    </div>
  );
}