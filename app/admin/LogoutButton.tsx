'use client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" />
      Logout
    </button>
  )
}
