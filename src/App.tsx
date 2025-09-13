import { Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/components/layouts/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { GamePage } from '@/pages/GamePage'
import { GameDetailPage } from '@/pages/GameDetailPage'
import { MyBetsPage } from '@/pages/MyBetsPage'
import { AccountPage } from '@/pages/AccountPage'
import { OtherPage } from '@/pages/OtherPage'

function App() {
  return (
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
  )
}

export default App