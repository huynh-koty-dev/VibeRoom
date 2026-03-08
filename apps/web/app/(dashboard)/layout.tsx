import { NavHeader } from '@/components/layout/nav-header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavHeader />
      <main className="flex-1 container mx-auto px-6 py-8 max-w-6xl">
        {children}
      </main>
    </div>
  )
}
