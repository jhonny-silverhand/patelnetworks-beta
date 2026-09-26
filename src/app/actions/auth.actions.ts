'use server';

import { revalidatePath } from 'next/cache';
import { AuthService } from '@/server/services/auth.service';

export interface SendOtpResult {
  success: boolean;
  phone?: string;
  isMock?: boolean;
  testOtp?: string;
  message?: string;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  user?: any;
  error?: string;
}

export async function sendOtpAction(phone: string): Promise<SendOtpResult> {
  try {
    const res = await AuthService.sendOtp(phone);
    return {
      success: true,
      phone: res.phone,
      isMock: res.isMock,
      testOtp: res.testOtp,
      message: res.message,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to dispatch verification code.' };
  }
}

export async function verifyOtpAction(phone: string, otpCode: string): Promise<VerifyOtpResult> {
  try {
    const res = await AuthService.verifyOtpAndLogin(phone, otpCode);
    revalidatePath('/');
    revalidatePath('/account');
    revalidatePath('/checkout');
    return { success: true, user: res.user };
  } catch (error: any) {
    return { success: false, error: error.message || 'OTP verification failed.' };
  }
}

export async function logoutAction() {
  try {
    await AuthService.logout();
    revalidatePath('/');
    revalidatePath('/account');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCurrentUserAction() {
  try {
    const user = await AuthService.getCurrentUser();
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProfileAction(data: {
  fullName?: string;
  companyName?: string;
  gstin?: string;
}) {
  try {
    const updated = await AuthService.updateProfile(data);
    revalidatePath('/account');
    revalidatePath('/checkout');
    return { success: true, customer: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveAddressAction(data: {
  id?: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  type?: string;
}) {
  try {
    const address = await AuthService.saveAddress(data);
    revalidatePath('/account');
    revalidatePath('/checkout');
    return { success: true, address };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAddressAction(addressId: string) {
  try {
    await AuthService.deleteAddress(addressId);
    revalidatePath('/account');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
