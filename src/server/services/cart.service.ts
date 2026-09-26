import { prisma } from '@/server/db';
import { cookies } from 'next/headers';

const CART_COOKIE_NAME = 'pn_cart_id';

/**
 * Retrieves the current session's cart ID from cookies or creates a new guest cart.
 */
export async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies();
  const existingCartId = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (existingCartId) {
    const existing = await prisma.cart.findUnique({
      where: { id: existingCartId },
    });
    if (existing) return existing.id;
  }

  // Create an anonymous guest customer for this cart session
  const guestPhone = `+9199999${Math.floor(10000 + Math.random() * 90000)}`;
  const guestUser = await prisma.user.create({
    data: {
      phone: guestPhone,
      customer: {
        create: {
          fullName: 'Guest Customer',
        },
      },
    },
    include: { customer: true },
  });

  const cart = await prisma.cart.create({
    data: {
      customerId: guestUser.customer!.id,
    },
  });

  cookieStore.set(CART_COOKIE_NAME, cart.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return cart.id;
}

/**
 * Returns full cart contents with live server-revalidated prices, inventory, and GST breakdowns.
 */
export async function getCart() {
  const cartId = await getOrCreateCartId();

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          sku: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { take: 1, orderBy: { sortOrder: 'asc' } },
                      brand: true,
                      category: true,
                    },
                  },
                },
              },
              inventory: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!cart) {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      gstAmount: 0,
      totalAmount: 0,
      isCodAllowed: true,
    };
  }

  let subtotal = 0;
  let totalGst = 0;
  let isCodAllowedForCart = true;
  let totalItemsCount = 0;

  const validatedItems = cart.items.map((item) => {
    const sku = item.sku;
    const product = sku.variant?.product;
    const sellingPrice = Number(sku.sellingPrice);
    const lineTotal = sellingPrice * item.quantity;

    // Check inventory
    const currentStock = sku.inventory?.currentStock ?? 0;
    const reservedStock = sku.inventory?.reservedStock ?? 0;
    const availableStock = Math.max(0, currentStock - reservedStock);

    // Recompute GST (18% inclusive)
    const taxableValue = lineTotal / 1.18;
    const gstForLine = lineTotal - taxableValue;

    subtotal += taxableValue;
    totalGst += gstForLine;
    totalItemsCount += item.quantity;

    if (product && !product.isCodAllowed) {
      isCodAllowedForCart = false;
    }

    return {
      id: item.id,
      skuId: sku.id,
      skuCode: sku.code,
      quantity: item.quantity,
      unitPrice: sellingPrice,
      lineTotal,
      availableStock,
      isOutOfStock: availableStock < item.quantity,
      productName: product?.name || 'Surveillance Hardware',
      variantName: sku.variant?.name || 'Standard',
      brandName: product?.brand?.name || 'Generic',
      imageUrl: product?.images[0]?.url || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80',
      isCodAllowed: product?.isCodAllowed ?? true,
    };
  });

  const totalAmount = Math.round(subtotal + totalGst);

  return {
    cartId: cart.id,
    items: validatedItems,
    itemCount: totalItemsCount,
    subtotal: Math.round(subtotal * 100) / 100,
    gstAmount: Math.round(totalGst * 100) / 100,
    totalAmount,
    isCodAllowed: isCodAllowedForCart,
  };
}

/**
 * Adds an item to the cart or increments its quantity atomically.
 */
export async function addItemToCart(skuCode: string, quantity = 1) {
  const cartId = await getOrCreateCartId();

  const sku = await prisma.sku.findUnique({
    where: { code: skuCode },
    include: { inventory: true },
  });

  if (!sku) {
    throw new Error(`Invalid hardware SKU: ${skuCode}`);
  }

  const currentStock = sku.inventory?.currentStock ?? 0;
  const reservedStock = sku.inventory?.reservedStock ?? 0;
  const availableStock = Math.max(0, currentStock - reservedStock);

  if (availableStock <= 0) {
    throw new Error(`SKU ${skuCode} is currently out of stock.`);
  }

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_skuId: {
        cartId,
        skuId: sku.id,
      },
    },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > availableStock) {
      throw new Error(`Cannot add more than ${availableStock} available units for SKU ${skuCode}.`);
    }

    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  }

  const requestedQty = Math.min(quantity, availableStock);
  return await prisma.cartItem.create({
    data: {
      cartId,
      skuId: sku.id,
      quantity: requestedQty,
    },
  });
}

/**
 * Updates quantity of a cart line item.
 */
export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return await removeCartItem(cartItemId);
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { sku: { include: { inventory: true } } },
  });

  if (!item) throw new Error('Cart item not found');

  const available = Math.max(
    0,
    (item.sku.inventory?.currentStock ?? 0) - (item.sku.inventory?.reservedStock ?? 0)
  );

  const safeQuantity = Math.min(quantity, available);

  return await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: safeQuantity },
  });
}

/**
 * Removes an item from the cart.
 */
export async function removeCartItem(cartItemId: string) {
  return await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
}

/**
 * Clears all items in a cart.
 */
export async function clearCart(cartId: string) {
  return await prisma.cartItem.deleteMany({
    where: { cartId },
  });
}
