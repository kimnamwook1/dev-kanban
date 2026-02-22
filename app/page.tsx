'use client';

import { useEffect } from 'react';
import { KanbanBoard } from '@/components/Board/KanbanBoard';
import { LoginScreen } from '@/components/Auth/LoginScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useProjectStore } from '@/store/useProjectStore';

export default function Home() {
  const { user, loading } = useAuth();
  const { setUserId, fetchProjects } = useProjectStore();

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      fetchProjects();
    } else {
      setUserId(null);
    }
  }, [user, setUserId, fetchProjects]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-board-bg">
        <div className="text-text-secondary">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <main className="min-h-screen bg-board-bg">
      <KanbanBoard />
    </main>
  );
}
