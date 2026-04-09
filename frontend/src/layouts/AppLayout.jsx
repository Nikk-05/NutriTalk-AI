import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'
import Footer from '../components/Footer'

export default function AppLayout() {
  const { pathname } = useLocation()
  // Chat page has its own full-height layout — suppress footer
  const isChat = pathname === '/chat'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className={`flex-1 ${isChat ? '' : 'pt-20'}`}>
        <Outlet />
      </main>
      {!isChat && <Footer />}
      <BottomNav />
    </div>
  )
}
