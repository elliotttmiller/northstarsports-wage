import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, User } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const location = useLocation();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Trophy size={24} weight="fill" className="text-accent" />
          <h1 className="text-xl font-bold text-foreground">NorthStar Sports</h1>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center space-x-4">
        <nav className="flex items-center space-x-2">
          <Button 
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/">Home</Link>
          </Button>
          <Button 
            variant={location.pathname === '/games' ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/games">Games</Link>
          </Button>
          <Button 
            variant={location.pathname === '/my-bets' ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/my-bets">My Bets</Link>
          </Button>
          <Button 
            variant={location.pathname === '/account' ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/account">
              <User size={16} className="mr-1" />
              Account
            </Link>
          </Button>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          Live Odds • Real-Time
        </div>
      </div>
    </header>
  );
};