'use server';

import { revalidatePath } from 'next/cache';
import {
  adjustSkuStock,
  toggleProductCodAllowed,
  toggleProductActive,
  updateOrderItemSerialNumbers,
  addProductImage,
  deleteProductImage,
  setPrimaryProductImage,
  updateProductImage,
} from '@/server/services/admin.service';
import { transitionOrderStatus } from '@/server/services/order.service';
import { createShipmentForOrder } from '@/server/services/shipping.service';
import { OrderStatus, MovementReason } from '@prisma/client';

export async function adjustStockAction(input: {
  skuId: string;
  quantityDelta: number;
  reason: MovementReason;
  notes?: string;
}) {
  try {
    const updated = await adjustSkuStock(input);
    revalidatePath('/admin');
    revalidatePath('/admin/inventory');
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to adjust stock' };
  }
}

export async function toggleProductCodAction(productId: string, isCodAllowed: boolean) {
  try {
    const updated = await toggleProductCodAllowed(productId, isCodAllowed);
    revalidatePath('/admin/products');
    revalidatePath('/admin/settings/cod');
    revalidatePath('/products');
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle COD policy' };
  }
}

export async function toggleProductActiveAction(productId: string, isActive: boolean) {
  try {
    const updated = await toggleProductActive(productId, isActive);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle product status' };
  }
}

export async function adminTransitionOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  comment?: string
) {
  try {
    const updated = await transitionOrderStatus(
      orderId,
      newStatus,
      comment || `Manual transition by Administrator to ${newStatus}`,
      'Administrator'
    );
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Status transition failed' };
  }
}

export async function adminCreateShipmentAction(orderId: string, carrier?: string) {
  try {
    const shipment = await createShipmentForOrder(orderId, {
      carrier,
      autoAdvanceStatus: true,
    });
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true, data: shipment };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to book shipment' };
  }
}

export async function saveSerialNumbersAction(
  orderItemId: string,
  serialNumbers: string[]
) {
  try {
    const updated = await updateOrderItemSerialNumbers(orderItemId, serialNumbers);
    revalidatePath('/admin/orders');
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save serial numbers' };
  }
}

export async function addProductImageAction(
  productId: string,
  url: string,
  altText?: string
) {
  try {
    if (!url || !url.trim().startsWith('http')) {
      return { success: false, error: 'Please enter a valid HTTP/HTTPS image URL' };
    }
    const created = await addProductImage({ productId, url, altText });
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, data: created };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add product image' };
  }
}

export async function deleteProductImageAction(imageId: string) {
  try {
    const deleted = await deleteProductImage(imageId);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, data: deleted };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete image' };
  }
}

export async function setPrimaryProductImageAction(productId: string, imageId: string) {
  try {
    const updated = await setPrimaryProductImage(productId, imageId);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to set primary image' };
  }
}

export async function updateProductImageAction(
  imageId: string,
  data: { url?: string; altText?: string }
) {
  try {
    const updated = await updateProductImage(imageId, data);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update image' };
  }
}

