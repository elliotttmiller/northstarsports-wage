import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
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
  const { setMobilePanel } = useNavigation();
  const controls = useAnimation();
  
  // Persist button position across sessions
  const [savedPosition, setSavedPosition] = useKV<Corner>('floating-button-position', 'bottom-right');
  
  const [isDragging, setIsDragging] = useState(false);
  const [currentCorner, setCurrentCorner] = useState<Corner>(savedPosition || 'bottom-right');
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const scale = useTransform(x, [-100, 0, 100], [0.9, 1, 0.9]);
  const opacity = useTransform(x, [-100, 0, 100], [0.8, 1, 0.8]);

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
  React.useEffect(() => {
    const position = getCornerPosition(currentCorner);
    x.set(position.x);
    y.set(position.y);
  }, [currentCorner, getCornerPosition, x, y]);

  const handleDragStart = () => {
    setIsDragging(false); // Will be set to true only if significant movement
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const wasDragging = isDragging;
    
    // Only animate to corner if actually dragged a significant distance
    if (wasDragging && (Math.abs(info.offset.x) > 20 || Math.abs(info.offset.y) > 20)) {
      const currentX = x.get();
      const currentY = y.get();
      
      const nearestCorner = findNearestCorner(currentX, currentY);
      const targetPosition = getCornerPosition(nearestCorner);
      
      // Animate to nearest corner using controls
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
    } else if (!wasDragging) {
      // If no significant dragging occurred, treat as a click
      setMobilePanel('betslip');
    }
    
    // Reset drag state
    setIsDragging(false);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only mark as dragging if user has moved significantly from start position
    if (!isDragging && (Math.abs(info.offset.x) > 10 || Math.abs(info.offset.y) > 10)) {
      setIsDragging(true);
    }
  };

  // Always render button, but change appearance based on bet count

  return (
    <motion.button
      className={`absolute pointer-events-auto w-16 h-16 rounded-full shadow-lg backdrop-blur-sm border-2 flex items-center justify-center transition-all duration-200 ${
        isDragging 
          ? 'bg-accent/90 border-accent-foreground/30 shadow-2xl' 
          : betSlip.bets.length > 0
            ? 'bg-accent/80 border-accent-foreground/20 hover:bg-accent/90 hover:shadow-xl active:scale-95'
            : 'bg-muted/80 border-muted-foreground/20 hover:bg-muted/90 hover:shadow-xl active:scale-95'
      }`}
      style={{
        x,
        y,
        scale,
        opacity
      }}
      animate={controls}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
      whileHover={{ 
        scale: isDragging ? 1.1 : 1.05,
        y: isDragging ? 0 : -2
      }}
      whileTap={{ scale: 0.95 }}
      dragConstraints={{
        left: 10,
        right: window.innerWidth - 74,
        top: 10,
        bottom: window.innerHeight - 154 // Account for button size + bottom nav
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
    >
      <div className="relative">
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
            key={betSlip.bets.length} // Re-animate on count change
          >
            {betSlip.bets.length}
          </motion.div>
        )}

        {/* Pulse effect when dragging */}
        {isDragging && (
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/30"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </div>

      {/* Add visual feedback for corner snapping */}
      {isDragging && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-accent-foreground/40"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </motion.button>
  );
};