/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { mockPrisma } from './mock-db';
import fs from 'fs';
import path from 'path';

// Helper to determine the effective database URL from process.env or .env file
function getEffectiveDatabaseUrl(): string | undefined {
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes('localhost') &&
    !process.env.DATABASE_URL.includes('127.0.0.1')
  ) {
    return process.env.DATABASE_URL;
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
      if (match && match[1] && !match[1].includes('localhost') && !match[1].includes('127.0.0.1')) {
        return match[1];
      }
    }
  } catch {
    // Ignore read errors
  }
  return process.env.DATABASE_URL;
}

const effectiveUrl = getEffectiveDatabaseUrl();
const isLiveDbConfigured = Boolean(
  effectiveUrl &&
  !effectiveUrl.includes('localhost') &&
  !effectiveUrl.includes('127.0.0.1')
);

const globalForPrisma = globalThis as unknown as {
  realPrismaInstance: PrismaClient | undefined;
};

let realPrisma: PrismaClient | null = globalForPrisma.realPrismaInstance || null;
if (!realPrisma && isLiveDbConfigured && effectiveUrl) {
  try {
    realPrisma = new PrismaClient({
      datasources: { db: { url: effectiveUrl } },
      log: ['error'],
    });
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.realPrismaInstance = realPrisma;
    }
  } catch (err: any) {
    console.warn('[AI Studio] Could not initialize live PrismaClient, using in-memory mock store:', err?.message);
    realPrisma = null;
  }
}

// Proxy wrapper that routes to real Prisma if configured and healthy, or falls back to in-memory mock store
export const prisma: PrismaClient = new Proxy(mockPrisma, {
  get(target, prop, receiver) {
    if (!realPrisma) {
      return Reflect.get(target, prop, receiver);
    }

    const realVal = (realPrisma as any)[prop];
    const mockVal = (target as any)[prop];

    if (typeof realVal === 'function') {
      return async (...args: any[]) => {
        try {
          return await realVal.apply(realPrisma, args);
        } catch (err: any) {
          console.warn(`[AI Studio] Real DB call failed for ${String(prop)}, falling back to mock:`, err?.message);
          return typeof mockVal === 'function' ? mockVal.apply(target, args) : mockVal;
        }
      };
    }

    if (realVal && typeof realVal === 'object') {
      return new Proxy(mockVal || {}, {
        get(subTarget, subProp) {
          const realSubMethod = realVal[subProp];
          const mockSubMethod = (subTarget as any)[subProp];

          if (typeof realSubMethod === 'function') {
            return async (...args: any[]) => {
              try {
                return await realSubMethod.apply(realVal, args);
              } catch (err: any) {
                console.warn(`[AI Studio] Real DB query failed for ${String(prop)}.${String(subProp)}, falling back to mock:`, err?.message);
                if (typeof mockSubMethod === 'function') {
                  return await mockSubMethod.apply(subTarget, args);
                }
                return mockSubMethod;
              }
            };
          }

          return mockSubMethod || realSubMethod;
        },
      });
    }

    return Reflect.get(target, prop, receiver);
  },
});

export default prisma;
