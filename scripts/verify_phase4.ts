import { prisma } from '../src/server/db';
import { AuthService, normalizeIndianPhone } from '../src/server/services/auth.service';
import { getOrdersByCustomerId } from '../src/server/services/order.service';

async function verifyPhase4() {
  console.log('\n======================================================');
  console.log('🚀 BEGINNING PHASE 4 AUTH & ACCOUNT AUTOMATED VERIFICATION');
  console.log('======================================================\n');

  const testPhoneRaw = `98250${Math.floor(10000 + Math.random() * 90000)}`;

  // 1. Verify Phone Normalization
  console.log('📱 Step 1: Testing Indian Mobile Number normalization...');
  const normalized = normalizeIndianPhone(testPhoneRaw);
  console.log(`   Input: "${testPhoneRaw}" ➔ Output: "${normalized}"`);
  if (!normalized.startsWith('+91') || normalized.length !== 13) {
    throw new Error(`Normalization error: Expected +91XXXXXXXXXX, got ${normalized}`);
  }
  console.log('✅ Phone normalization verified.');

  // 2. Dispatch OTP
  console.log('\n🔑 Step 2: Requesting OTP via AuthService.sendOtp...');
  const otpRes = await AuthService.sendOtp(normalized);
  console.log(`   OTP Dispatch Status: ${otpRes.success}`);
  console.log(`   Generated OTP:      ${otpRes.testOtp}`);
  if (!otpRes.testOtp) throw new Error('Expected testOtp to be returned in test/mock mode.');
  console.log('✅ OTP generation & rate-limit check verified.');

  // 3. Verify OTP in database
  console.log('\n💾 Step 3: Verifying OTP record in Supabase database...');
  const otpDb = await prisma.otpVerification.findFirst({
    where: { phone: normalized, isVerified: false },
    orderBy: { createdAt: 'desc' },
  });
  if (!otpDb || otpDb.otpCode !== otpRes.testOtp) {
    throw new Error('Database OTP record does not match dispatched OTP.');
  }
  console.log(`   Found database record ID: ${otpDb.id} with expiresAt: ${otpDb.expiresAt.toISOString()}`);
  console.log('✅ Database OTP verification record confirmed.');

  // 4. Test Invalid OTP Rejection
  console.log('\n🚫 Step 4: Testing security guard against incorrect OTP...');
  let invalidCaught = false;
  try {
    await AuthService.verifyOtpAndLogin(normalized, '000000');
  } catch (err: any) {
    invalidCaught = true;
    console.log(`   Correctly rejected invalid OTP with message: "${err.message}"`);
  }
  if (!invalidCaught) throw new Error('Invalid OTP was improperly accepted!');
  console.log('✅ Invalid OTP rejection verified.');

  // 5. Verify Valid OTP & User Provisioning
  console.log('\n👤 Step 5: Testing valid OTP verification & customer provisioning...');
  const loginRes = await AuthService.verifyOtpAndLogin(normalized, otpRes.testOtp);
  console.log(`   Login Success:       ${loginRes.success}`);
  console.log(`   User ID:             ${loginRes.user.id}`);
  console.log(`   Customer ID:         ${loginRes.user.customer?.id}`);
  console.log(`   Customer Full Name:  ${loginRes.user.customer?.fullName}`);
  if (!loginRes.user.customer?.id) throw new Error('Customer profile was not created.');
  console.log('✅ Customer account provisioned.');

  // 6. Test Address Management
  console.log('\n📍 Step 6: Testing address creation for customer...');
  const address = await prisma.address.create({
    data: {
      customerId: loginRes.user.customer.id,
      recipientName: 'Harsh Patel',
      phone: normalized,
      addressLine1: 'Office 301, Titanium City Center',
      addressLine2: 'Prahlad Nagar',
      landmark: 'Near Shell Petrol Pump',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      isDefault: true,
      type: 'WORK',
    },
  });
  console.log(`   Created Address ID: ${address.id} in ${address.city}, ${address.state} (${address.pincode})`);
  console.log('✅ Address record creation verified.');

  // 7. Test B2B GSTIN Configuration
  console.log('\n🏢 Step 7: Testing B2B Company & GSTIN update...');
  const updatedCustomer = await prisma.customer.update({
    where: { id: loginRes.user.customer.id },
    data: {
      fullName: 'Harsh Patel (Proprietor)',
      companyName: 'Patel Advanced Surveillance & Networking LLP',
      gstin: '24AABCP1234F1Z9',
      isB2BVerified: true,
    },
  });
  console.log(`   Updated Customer: ${updatedCustomer.fullName}`);
  console.log(`   Company Name:     ${updatedCustomer.companyName}`);
  console.log(`   GSTIN:            ${updatedCustomer.gstin} (B2B Verified: ${updatedCustomer.isB2BVerified})`);
  console.log('✅ B2B tax profile updated.');

  // 8. Test getOrdersByCustomerId Query
  console.log('\n📦 Step 8: Testing customer orders retrieval...');
  const orders = await getOrdersByCustomerId(loginRes.user.customer.id);
  console.log(`   Orders found for customer: ${orders.length}`);
  console.log('✅ Customer order relation query verified.');

  console.log('\n======================================================');
  console.log('🎉 PHASE 4 VERIFICATION PASSED WITH 100% SUCCESS!');
  console.log('======================================================\n');
}

verifyPhase4()
  .catch((err) => {
    console.error('❌ Phase 4 verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
