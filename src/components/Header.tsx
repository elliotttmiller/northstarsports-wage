import React from 'react';
import { Trophy } from '@phosphor-icons/react';

export const Header = () => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Trophy size={24} weight="fill" className="text-accent" />
          <h1 className="text-xl font-bold text-foreground">NorthStar Sports</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          Live Odds • Real-Time
        </div>
      </div>
    </header>
  );
};