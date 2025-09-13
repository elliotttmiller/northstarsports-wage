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
  
  // Persist button position across sessions - now saves actual coordinates
  const [savedPosition, setSavedPosition] = useKV<Position | undefined>('floating-button-position', undefined);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track drag state more precisely
  const dragStartTime = useRef<number>(0);
  const hasMoved = useRef(false);
  const totalDragDistance = useRef(0);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Hide button when bet slip modal is open
  const isModalOpen = navigation.mobilePanel === 'betslip';

  // Get default position
  const getDefaultPosition = useCallback((): Position => {
    const buttonSize = 56;
    const margin = 20;
    return {
      x: window.innerWidth - buttonSize - margin,
      y: window.innerHeight - buttonSize - margin - 80 // Account for bottom nav
    };
  }, []);

  // Initialize position from saved coordinates or default
  useEffect(() => {
    const initPosition = savedPosition || getDefaultPosition();
    x.set(initPosition.x);
    y.set(initPosition.y);
    setIsInitialized(true);
  }, [savedPosition, x, y, getDefaultPosition]);

  // Handle window resize to keep button within bounds
  useEffect(() => {
    const handleResize = () => {
      const currentX = x.get();
      const currentY = y.get();
      const buttonSize = 56; // Updated smaller button size
      const margin = 20;
      
      // Ensure button stays within new viewport bounds
      const maxX = window.innerWidth - buttonSize - margin;
      const maxY = window.innerHeight - buttonSize - margin - 80; // Account for bottom nav
      
      const newX = Math.min(Math.max(margin, currentX), maxX);
      const newY = Math.min(Math.max(margin, currentY), maxY);
      
      if (newX !== currentX || newY !== currentY) {
        controls.start({
          x: newX,
          y: newY,
          transition: { duration: 0.3, ease: "easeOut" }
        });
        setSavedPosition({ x: newX, y: newY });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [controls, x, y, setSavedPosition]);

  const handleDragStart = () => {
    if (!isInitialized) return;
    dragStartTime.current = Date.now();
    hasMoved.current = false;
    totalDragDistance.current = 0;
    setIsDragging(false);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isInitialized) return;
    const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    totalDragDistance.current = dragDistance;
    
    // Only start visual dragging state after significant movement
    if (dragDistance > 10 && !hasMoved.current) {
      hasMoved.current = true;
      setIsDragging(true);
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isInitialized) return;
    const dragDuration = Date.now() - dragStartTime.current;
    const totalDistance = totalDragDistance.current;
    
    // Determine if this was an intentional drag or just a tap
    const wasIntentionalDrag = totalDistance > 15 || (dragDuration > 150 && totalDistance > 8);
    
    if (wasIntentionalDrag && hasMoved.current) {
      // Handle drag - save new position
      const currentX = x.get();
      const currentY = y.get();
      
      // Save the new position
      setSavedPosition({ x: currentX, y: currentY });
    } else {
      // Handle tap - open bet slip
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
    if (hasMoved.current || totalDragDistance.current > 8) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Only handle click if no drag occurred
    setMobilePanel('betslip');
  };

  return (
    <motion.button
      className={`absolute w-14 h-14 rounded-full shadow-lg backdrop-blur-md border flex items-center justify-center transition-all duration-200 z-50 pointer-events-auto ${
        isDragging 
          ? 'bg-accent/40 border-accent-foreground/20 shadow-2xl cursor-grabbing scale-105' 
          : betSlip.bets.length > 0
            ? 'bg-accent/30 border-accent-foreground/15 hover:bg-accent/40 hover:shadow-xl active:scale-95 cursor-pointer'
            : 'bg-muted/25 border-muted-foreground/10 hover:bg-muted/35 hover:shadow-xl active:scale-95 cursor-pointer'
      }`}
      style={{
        x,
        y,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        visibility: (isModalOpen || !isInitialized) ? 'hidden' : 'visible',
        opacity: (isModalOpen || !isInitialized) ? 0 : 1
      }}
      animate={{
        scale: (isModalOpen || !isInitialized) ? 0 : 1, 
        opacity: (isModalOpen || !isInitialized) ? 0 : 1,
        ...controls
      }}
      drag={!isModalOpen && isInitialized}
      dragMomentum={false}
      dragElastic={0}
      dragPropagation={false}
      dragConstraints={isInitialized ? {
        left: 10,
        right: window.innerWidth - 66, // Updated for smaller button
        top: 10,
        bottom: window.innerHeight - 146 // Updated for smaller button + bottom nav
      } : {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={!isDragging && !isModalOpen && isInitialized ? { 
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      whileTap={!isDragging && !isModalOpen && isInitialized ? { 
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {}}
      initial={{ scale: 0, opacity: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: 0.4 
      }}
    >
      <div className="relative pointer-events-none">
        {betSlip.bets.length > 0 ? (
          <Receipt 
            size={20} 
            weight="fill" 
            className="text-accent-foreground"
          />
        ) : (
          <Plus 
            size={20} 
            weight="bold" 
            className="text-muted-foreground"
          />
        )}
        
        {/* Bet count badge - only show when there are bets */}
        {betSlip.bets.length > 0 && (
          <motion.div 
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border border-accent-foreground/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            key={betSlip.bets.length}
          >
            {betSlip.bets.length}
          </motion.div>
        )}

        {/* Subtle drag indicator */}
        {isDragging && (
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/20 border border-dashed border-accent-foreground/30"
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </motion.button>
  );
};