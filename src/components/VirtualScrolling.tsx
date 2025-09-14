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
  renderItem,
  className,
  scrollBehavior = 'smooth'
}: VirtualScrollContainerProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={parentRef}
      className={cn(
        'overflow-auto seamless-scroll',
        className
      )}
      style={{
        scrollBehavior,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              ease: [0.4, 0.0, 0.2, 1]
            }}
          >
            {renderItem(item, index)}
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
  showScrollbar = false
}: SmoothScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollbarClass = showScrollbar ? 'virtual-scrollbar' : 'seamless-scroll'

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
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1]
        }}
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
        'overflow-auto seamless-scroll',
        className
      )}
      style={{ 
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
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