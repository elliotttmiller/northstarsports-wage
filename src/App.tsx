import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { RootLayout } from '@/components/layouts/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { GamePage } from '@/pages/GamePage'
import { GameDetailPage } from '@/pages/GameDetailPage'
import { MyBetsPage } from '@/pages/MyBetsPage'
import { AccountPage } from '@/pages/AccountPage'
import { OtherPage } from '@/pages/OtherPage'

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
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="games" element={<GamePage />} />
          <Route path="games/:gameId" element={<GameDetailPage />} />
          <Route path="my-bets" element={<MyBetsPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="other" element={<OtherPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
