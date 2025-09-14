import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { MinimalApp } from '@/components/MinimalApp'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading NSSPORTSCLUB...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="*" element={<MinimalApp />} />
      </Routes>
    </Suspense>
  )
}

export default App