// src/components/SortControls.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Flame, Clock, TrendingUp } from 'lucide-react';
import type { SortOption } from '@/types/post';

interface SortControlsProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export function SortControls({ sortBy, setSortBy }: SortControlsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={sortBy === 'hot' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSortBy('hot')}
        className="flex items-center gap-1"
      >
        <Flame size={16} />
        Hot
      </Button>
      <Button
        variant={sortBy === 'new' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSortBy('new')}
        className="flex items-center gap-1"
      >
        <Clock size={16} />
        New
      </Button>
      <Button
        variant={sortBy === 'top' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSortBy('top')}
        className="flex items-center gap-1"
      >
        <TrendingUp size={16} />
        Top
      </Button>
    </div>
  );
}