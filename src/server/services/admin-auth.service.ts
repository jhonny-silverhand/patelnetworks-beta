import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/server/db';
import { UserRole } from '@prisma/client';

export const ADMIN_COOKIE_NAME = 'pn_admin_session';
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'patel_networks_secure_jwt_secret_key_32_bytes!';
const JWT_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

// Configurable admin credentials (defaults for dev/staging)
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'superadmin@patelnetworks.in';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'patel@admin2026';

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  fullName: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export class AdminAuthService {
  /**
   * Authenticates an admin user via email & password and sets an isolated HTTP-only session cookie.
   */
  static async loginAdmin(emailInput: string, passwordInput: string): Promise<{
    success: boolean;
    error?: string;
    admin?: { email: string; fullName: string; role: string };
  }> {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email || !password) {
      return { success: false, error: 'Please enter both admin email and password.' };
    }

    let isValid = false;
    let adminPayload: AdminSessionPayload | null = null;

    // 1. Check database for existing admin user
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          email,
          role: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INVENTORY_MANAGER, UserRole.ORDER_MANAGER] },
          isActive: true,
        },
        include: { adminProfile: true },
      });

      if (dbUser && dbUser.passwordHash) {
        // Direct match or standard check
        if (dbUser.passwordHash === password) {
          isValid = true;
          adminPayload = {
            adminId: dbUser.id,
            email: dbUser.email || email,
            fullName: dbUser.adminProfile?.fullName || 'Super Administrator',
            role: dbUser.role,
          };
        }
      }
    } catch {
      // Database query error fallback to default credentials
    }

    // 2. Fallback / Standard configured Super Admin credentials
    if (!isValid) {
      if (email === DEFAULT_ADMIN_EMAIL.toLowerCase() && password === DEFAULT_ADMIN_PASSWORD) {
        isValid = true;
        adminPayload = {
          adminId: 'admin-root-superadmin',
          email: DEFAULT_ADMIN_EMAIL,
          fullName: 'Patel Networks Operations Lead',
          role: UserRole.SUPER_ADMIN,
        };
      }
    }

    if (!isValid || !adminPayload) {
      return { success: false, error: 'Invalid admin credentials or unauthorized account.' };
    }

    // 3. Issue secure 7-day Admin JWT
    const token = await new SignJWT({
      adminId: adminPayload.adminId,
      email: adminPayload.email,
      fullName: adminPayload.fullName,
      role: adminPayload.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_KEY);

    // 4. Set secure HTTP-only cookie
    try {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    } catch {
      // In test or non-request contexts
    }

    return {
      success: true,
      admin: {
        email: adminPayload.email,
        fullName: adminPayload.fullName,
        role: adminPayload.role,
      },
    };
  }

  /**
   * Reads and verifies the admin session from HTTP cookies.
   */
  static async getAdminSession(): Promise<AdminSessionPayload | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
      if (!token) return null;

      const { payload } = await jwtVerify(token, JWT_KEY);
      return payload as unknown as AdminSessionPayload;
    } catch {
      return null;
    }
  }

  /**
   * Logs out the current admin by clearing the session cookie.
   */
  static async logoutAdmin(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
    } catch {
      // Graceful fallback
    }
  }
}
