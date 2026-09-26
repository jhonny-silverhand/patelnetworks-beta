'use server';

import { revalidatePath } from 'next/cache';
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
} from '@/server/services/cart.service';

export async function getCartAction() {
  return await getCart();
}

export async function addToCartAction(skuCode: string, quantity = 1) {
  try {
    const item = await addItemToCart(skuCode, quantity);
    revalidatePath('/cart');
    revalidatePath('/');
    return { success: true, item };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  try {
    const updated = await updateCartItemQuantity(itemId, quantity);
    revalidatePath('/cart');
    return { success: true, updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeFromCartAction(itemId: string) {
  try {
    await removeCartItem(itemId);
    revalidatePath('/cart');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
