import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';
import { Receipt, Plus } from '@phosphor-icons/react';
import { useBetSlip } from '@/context/BetSlipContext';
import { useNavigation } from '@/context/NavigationContext';
import { useKV } from '@github/spark/hooks';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface Position {
  x: number;
  y: number;
}

export const FloatingBetSlipButton = () => {
  const { betSlip } = useBetSlip();
  const { navigation, setMobilePanel } = useNavigation();
  const controls = useAnimation();
  
  // Persist button position across sessions
  const [savedPosition, setSavedPosition] = useKV<Corner>('floating-button-position', 'bottom-right');
  
  const [isDragging, setIsDragging] = useState(false);
  const [currentCorner, setCurrentCorner] = useState<Corner>(savedPosition || 'bottom-right');
  
  // Track drag state more precisely
  const dragStartTime = useRef<number>(0);
  const hasMoved = useRef(false);
  const totalDragDistance = useRef(0);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Hide button when bet slip modal is open
  const isModalOpen = navigation.mobilePanel === 'betslip';

  // Calculate corner positions based on viewport
  const getCornerPosition = useCallback((corner: Corner): Position => {
    const margin = 20; // Distance from screen edges
    const buttonSize = 64; // Button size including padding
    
    switch (corner) {
      case 'top-left':
        return { x: margin, y: margin };
      case 'top-right':
        return { x: window.innerWidth - buttonSize - margin, y: margin };
      case 'bottom-left':
        return { x: margin, y: window.innerHeight - buttonSize - margin - 80 }; // 80px for bottom nav
      case 'bottom-right':
      default:
        return { x: window.innerWidth - buttonSize - margin, y: window.innerHeight - buttonSize - margin - 80 };
    }
  }, []);

  // Find nearest corner based on current position
  const findNearestCorner = useCallback((currentX: number, currentY: number): Corner => {
    const centerX = window.innerWidth / 2;
    const centerY = (window.innerHeight - 80) / 2; // Account for bottom nav
    
    if (currentX < centerX && currentY < centerY) return 'top-left';
    if (currentX >= centerX && currentY < centerY) return 'top-right';
    if (currentX < centerX && currentY >= centerY) return 'bottom-left';
    return 'bottom-right';
  }, []);

  // Initialize position based on saved corner
  useEffect(() => {
    const position = getCornerPosition(currentCorner);
    x.set(position.x);
    y.set(position.y);
  }, [currentCorner, getCornerPosition, x, y]);

  // Handle window resize to maintain corner positioning
  useEffect(() => {
    const handleResize = () => {
      const position = getCornerPosition(currentCorner);
      controls.start({
        x: position.x,
        y: position.y,
        transition: { duration: 0.3, ease: "easeOut" }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentCorner, getCornerPosition, controls]);

  const handleDragStart = () => {
    dragStartTime.current = Date.now();
    hasMoved.current = false;
    totalDragDistance.current = 0;
    setIsDragging(false);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    totalDragDistance.current = dragDistance;
    
    // Only start visual dragging state after significant movement
    if (dragDistance > 15 && !hasMoved.current) {
      hasMoved.current = true;
      setIsDragging(true);
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDuration = Date.now() - dragStartTime.current;
    const totalDistance = totalDragDistance.current;
    
    // Determine if this was an intentional drag or just a tap
    const wasIntentionalDrag = totalDistance > 20 || (dragDuration > 200 && totalDistance > 10);
    
    if (wasIntentionalDrag && hasMoved.current) {
      // Handle drag - snap to nearest corner
      const currentX = x.get();
      const currentY = y.get();
      
      const nearestCorner = findNearestCorner(currentX, currentY);
      const targetPosition = getCornerPosition(nearestCorner);
      
      // Animate to nearest corner
      await controls.start({
        x: targetPosition.x,
        y: targetPosition.y,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 30,
          duration: 0.5
        }
      });
      
      // Update state and persist
      setCurrentCorner(nearestCorner);
      setSavedPosition(nearestCorner);
    } else {
      // Handle tap - open bet slip
      setMobilePanel('betslip');
      
      // Ensure button stays in current corner position
      const targetPosition = getCornerPosition(currentCorner);
      if (totalDistance > 5) {
        await controls.start({
          x: targetPosition.x,
          y: targetPosition.y,
          transition: {
            type: "spring",
            stiffness: 600,
            damping: 40,
            duration: 0.3
          }
        });
      }
    }
    
    // Reset all states
    setIsDragging(false);
    hasMoved.current = false;
    totalDragDistance.current = 0;
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if we've been dragging
    if (hasMoved.current || totalDragDistance.current > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Only handle click if no drag occurred
    setMobilePanel('betslip');
  };

  return (
    <motion.button
      className={`absolute w-16 h-16 rounded-full shadow-lg backdrop-blur-sm border-2 flex items-center justify-center transition-all duration-200 z-50 pointer-events-auto ${
        isDragging 
          ? 'bg-accent/90 border-accent-foreground/30 shadow-2xl cursor-grabbing' 
          : betSlip.bets.length > 0
            ? 'bg-accent/80 border-accent-foreground/20 hover:bg-accent/90 hover:shadow-xl active:scale-95 cursor-pointer'
            : 'bg-muted/80 border-muted-foreground/20 hover:bg-muted/90 hover:shadow-xl active:scale-95 cursor-pointer'
      }`}
      style={{
        x,
        y,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        visibility: isModalOpen ? 'hidden' : 'visible',
        opacity: isModalOpen ? 0 : 1
      }}
      animate={controls}
      drag={!isModalOpen}
      dragMomentum={false}
      dragElastic={0}
      dragPropagation={false}
      dragConstraints={{
        left: 10,
        right: window.innerWidth - 74,
        top: 10,
        bottom: window.innerHeight - 154
      }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={!isDragging && !isModalOpen ? { 
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!isDragging && !isModalOpen ? { 
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {}}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
    >
      <div className="relative pointer-events-none">
        {betSlip.bets.length > 0 ? (
          <Receipt 
            size={24} 
            weight="fill" 
            className="text-accent-foreground"
          />
        ) : (
          <Plus 
            size={24} 
            weight="bold" 
            className="text-muted-foreground"
          />
        )}
        
        {/* Bet count badge - only show when there are bets */}
        {betSlip.bets.length > 0 && (
          <motion.div 
            className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border-2 border-accent-foreground/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            key={betSlip.bets.length}
          >
            {betSlip.bets.length}
          </motion.div>
        )}

        {/* Drag indicator */}
        {isDragging && (
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/30 border-2 border-dashed border-accent-foreground/40"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.5, 0.8, 0.5]
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