import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';
import { Receipt, Plus } from '@phosphor-icons/react';
import { useBetSlip } from '@/context/BetSlipContext';
import { useNavigation } from '@/context/NavigationContext';
import { useKV } from '@github/spark/hooks';

interface Position {
  x: number;
  y: number;
}

export const FloatingBetSlipButton = () => {
  const { betSlip } = useBetSlip();
  const { navigation, setMobilePanel } = useNavigation();
  const controls = useAnimation();
  
  // Persist button position across sessions
  const [savedPosition, setSavedPosition] = useKV<Position | undefined>('floating-button-position', undefined);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track drag state more precisely
  const dragStartTime = useRef<number>(0);
  const hasMoved = useRef(false);
  const totalDragDistance = useRef(0);
  const initialPosition = useRef<Position>({ x: 0, y: 0 });
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Hide button when bet slip modal is open
  const isModalOpen = navigation.mobilePanel === 'betslip';

  // Get default position - smaller button, more translucent
  const getDefaultPosition = useCallback((): Position => {
    const buttonSize = 48; // Smaller button
    const margin = 16;
    return {
      x: window.innerWidth - buttonSize - margin,
      y: window.innerHeight - buttonSize - margin - 80 // Account for bottom nav
    };
  }, []);

  // Initialize position from saved coordinates or default
  useEffect(() => {
    if (!isInitialized) {
      const initPosition = savedPosition || getDefaultPosition();
      x.set(initPosition.x);
      y.set(initPosition.y);
      initialPosition.current = initPosition;
      setIsInitialized(true);
    }
  }, [savedPosition, x, y, getDefaultPosition, isInitialized]);

  // Handle window resize to keep button within bounds
  useEffect(() => {
    if (!isInitialized) return;

    const handleResize = () => {
      const currentX = x.get();
      const currentY = y.get();
      const buttonSize = 48;
      const margin = 16;
      
      // Ensure button stays within new viewport bounds
      const maxX = window.innerWidth - buttonSize - margin;
      const maxY = window.innerHeight - buttonSize - margin - 80;
      
      const newX = Math.min(Math.max(margin, currentX), maxX);
      const newY = Math.min(Math.max(margin, currentY), maxY);
      
      if (newX !== currentX || newY !== currentY) {
        x.set(newX);
        y.set(newY);
        setSavedPosition({ x: newX, y: newY });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x, y, setSavedPosition, isInitialized]);

  const handleDragStart = () => {
    if (!isInitialized) return;
    dragStartTime.current = Date.now();
    hasMoved.current = false;
    totalDragDistance.current = 0;
    initialPosition.current = { x: x.get(), y: y.get() };
    setIsDragging(false);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isInitialized) return;
    const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    totalDragDistance.current = dragDistance;
    
    // Only start visual dragging state after significant movement
    if (dragDistance > 8 && !hasMoved.current) {
      hasMoved.current = true;
      setIsDragging(true);
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isInitialized) return;
    const dragDuration = Date.now() - dragStartTime.current;
    const totalDistance = totalDragDistance.current;
    
    // Determine if this was an intentional drag or just a tap
    const wasIntentionalDrag = totalDistance > 12 || (dragDuration > 150 && totalDistance > 6);
    
    if (wasIntentionalDrag && hasMoved.current) {
      // Handle drag - save new position
      const currentX = x.get();
      const currentY = y.get();
      setSavedPosition({ x: currentX, y: currentY });
    } else {
      // Handle tap - open bet slip modal
      setMobilePanel('betslip');
    }
    
    // Reset all states
    setIsDragging(false);
    hasMoved.current = false;
    totalDragDistance.current = 0;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isInitialized) return;
    
    // Prevent click if we've been dragging
    if (hasMoved.current || totalDragDistance.current > 6) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Only handle click if no drag occurred
    setMobilePanel('betslip');
  };

  // Don't render if modal is open or not initialized
  if (isModalOpen || !isInitialized) {
    return null;
  }

  return (
    <motion.button
      className={`absolute w-12 h-12 rounded-full shadow-lg backdrop-blur-md border flex items-center justify-center transition-all duration-200 z-50 pointer-events-auto ${
        isDragging 
          ? 'bg-accent/25 border-accent-foreground/15 shadow-2xl cursor-grabbing scale-105' 
          : betSlip.bets.length > 0
            ? 'bg-accent/20 border-accent-foreground/10 hover:bg-accent/30 hover:shadow-xl active:scale-95 cursor-pointer'
            : 'bg-muted/15 border-muted-foreground/8 hover:bg-muted/25 hover:shadow-xl active:scale-95 cursor-pointer'
      }`}
      style={{
        x,
        y,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
      drag={true}
      dragMomentum={false}
      dragElastic={0.1}
      dragPropagation={false}
      dragConstraints={{
        left: 8,
        right: window.innerWidth - 56,
        top: 8,
        bottom: window.innerHeight - 136
      }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={!isDragging ? { 
        scale: 1.1,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      whileTap={!isDragging ? { 
        scale: 0.9,
        transition: { duration: 0.1 }
      } : {}}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        duration: 0.3 
      }}
    >
      <div className="relative pointer-events-none">
        {betSlip.bets.length > 0 ? (
          <Receipt 
            size={18} 
            weight="fill" 
            className="text-accent-foreground"
          />
        ) : (
          <Plus 
            size={18} 
            weight="bold" 
            className="text-muted-foreground"
          />
        )}
        
        {/* Bet count badge - only show when there are bets */}
        {betSlip.bets.length > 0 && (
          <motion.div 
            className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border border-accent-foreground/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            key={betSlip.bets.length}
          >
            {betSlip.bets.length > 9 ? '9+' : betSlip.bets.length}
          </motion.div>
        )}

        {/* Subtle drag indicator */}
        {isDragging && (
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/15 border border-dashed border-accent-foreground/20"
            initial={{ scale: 1, opacity: 0.2 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </motion.button>
  );
};