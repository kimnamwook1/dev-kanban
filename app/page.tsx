'use client';

import { KanbanBoard } from '@/components/Board/KanbanBoard';

export default function Home() {
  return (
    <main className="min-h-screen bg-board-bg">
      <KanbanBoard />
    </main>
  );
}
