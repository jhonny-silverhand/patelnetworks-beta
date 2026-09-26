'use server';

import { AdminAuthService } from '@/server/services/admin-auth.service';
import { redirect } from 'next/navigation';

export async function adminLoginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const next = (formData.get('next') as string) || '/admin';

  const res = await AdminAuthService.loginAdmin(email, password);

  if (!res.success) {
    return { success: false, error: res.error || 'Authentication failed' };
  }

  return { success: true, redirectUrl: next.startsWith('/admin') ? next : '/admin' };
}

export async function adminLogoutAction() {
  await AdminAuthService.logoutAdmin();
  redirect('/admin/login');
}
