'use client';

import Link from 'next/link';
import { Eye, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminMobileNav } from './AdminMobileNav';
import { logout } from '@/lib/actions/admin-auth';

interface AdminHeaderProps {
  userName?: string;
  userRole?: string;
}

export function AdminHeader({ userName, userRole }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex min-h-16 w-full items-center justify-between border-b bg-white/95 px-3 shadow-sm backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <AdminMobileNav />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-900">Panel administrativo</p>
          <p className="text-xs text-gray-500">Gestioná Corpicia desde un solo lugar</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/" target="_blank" className="hidden md:inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
          <Eye className="h-4 w-4" /> Ver sitio web
        </Link>
        <div className="hidden h-7 w-px bg-gray-200 sm:block" />
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-corpicia-green"><UserCircle className="h-5 w-5" /></span>
          <div className="hidden xl:flex xl:flex-col xl:items-start">
            <span className="max-w-40 truncate text-sm font-semibold leading-none text-gray-900">{userName || 'Administrador'}</span>
            <span className="mt-1 text-[11px] capitalize text-gray-500">{userRole}</span>
          </div>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
