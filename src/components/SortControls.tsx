import { Flame, Clock, TrendingUp } from 'lucide-react';
import type { SortOption } from '@/types/post';

interface SortControlsProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export function SortControls({ sortBy, setSortBy }: SortControlsProps) {
  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => setSortBy('hot')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md ${
          sortBy === 'hot'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <Flame size={20} /> Hot
      </button>
      <button
        onClick={() => setSortBy('new')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md ${
          sortBy === 'new'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <Clock size={20} /> New
      </button>
      <button
        onClick={() => setSortBy('top')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md ${
          sortBy === 'top'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <TrendingUp size={20} /> Top
      </button>
    </div>
  );
}