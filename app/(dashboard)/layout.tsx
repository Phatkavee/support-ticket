import LoginLogoutButton from '@/components/LoginLogoutButton'
import UserGreetText from '@/components/UserGreetText'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <nav className="hidden md:flex space-x-6">
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <br></br>
                <Link 
                  href="/projects" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  โครงการ
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <UserGreetText />
              <LoginLogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  )
}
