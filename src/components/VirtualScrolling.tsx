import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, ReactNode, CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface VirtualScrollContainerProps {
  items: any[]
  itemHeight?: number
  renderItem: (item: any, index: number) => ReactNode
  className?: string
  gap?: number
  overscan?: number
  scrollBehavior?: 'smooth' | 'auto'
}

export function VirtualScrollContainer({
  items,
  itemHeight = 60,
  renderItem,
  className,
  gap = 8,
  overscan = 5,
  scrollBehavior = 'smooth'
}: VirtualScrollContainerProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan,
  })

  return (
    <div
      ref={parentRef}
      className={cn(
        'overflow-auto custom-scrollbar',
        className
      )}
      style={{
        scrollBehavior
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem, index) => (
          <motion.div
            key={virtualItem.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              ease: [0.4, 0.0, 0.2, 1]
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size - gap}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface SmoothScrollContainerProps {
  children: ReactNode
  className?: string
  maxHeight?: string
  showScrollbar?: boolean
}

export function SmoothScrollContainer({
  children,
  className,
  maxHeight = '100%',
  showScrollbar = true
}: SmoothScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollbarClass = showScrollbar ? 'custom-scrollbar' : 'scrollbar-hide'

  return (
    <div
      ref={scrollRef}
      className={cn(
        'overflow-auto',
        scrollbarClass,
        className
      )}
      style={{
        maxHeight,
        scrollBehavior: 'smooth',
        scrollbarWidth: showScrollbar ? 'thin' : 'none',
        msOverflowStyle: showScrollbar ? 'auto' : 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

interface InfiniteScrollProps {
  items: any[]
  renderItem: (item: any, index: number) => ReactNode
  loadMore: () => void
  hasMore: boolean
  loading: boolean
  className?: string
  threshold?: number
}

export function InfiniteScrollContainer({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading,
  className,
  threshold = 300
}: InfiniteScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const handleScroll = () => {
    const element = scrollRef.current
    if (!element) return

    const { scrollTop, scrollHeight, clientHeight } = element
    
    if (scrollHeight - scrollTop - clientHeight < threshold && hasMore && !loading) {
      loadMore()
    }
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={cn(
        'overflow-auto custom-scrollbar',
        className
      )}
      style={{ scrollBehavior: 'smooth' }}
    >
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.02,
              ease: [0.4, 0.0, 0.2, 1]
            }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
        
        {loading && hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-4"
          >
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
          </motion.div>
        )}
      </div>
    </div>
  )
}