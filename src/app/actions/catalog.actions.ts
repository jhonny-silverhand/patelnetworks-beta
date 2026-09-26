'use server';

import { searchProductsQuick } from '@/server/services/catalog.service';

export async function quickSearchAction(query: string) {
  try {
    const results = await searchProductsQuick(query);
    return { success: true, data: results };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Search failed';
    return { success: false, error: msg, data: [] };
  }
}
