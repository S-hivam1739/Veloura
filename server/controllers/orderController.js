import crypto from 'crypto';
import Razorpay from 'razorpay';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { validateIndianPhoneNumber } from '../utils/phoneValidator.js';
import { sendOrderConfirmationEmail } from '../utils/email.js';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

let razorpayInstance = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID.includes('placeholder')) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
  } catch (err) {
    console.warn('⚠️ Razorpay initialization warning:', err.message);
  }
}

// In-memory fallback orders store
const memoryOrders = [];

function generateOrderId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
}

/**
 * POST /api/orders/razorpay
 * Create Razorpay order on server
 */
export async function createRazorpayOrder(req, res) {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid order amount is required.' });
    }

    const orderReceipt = receipt || `rcpt_${Date.now()}`;
    const amountInPaise = Math.round(Number(amount) * 100);

    if (razorpayInstance) {
      const options = {
        amount: amountInPaise,
        currency,
        receipt: orderReceipt,
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      return res.json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: RAZORPAY_KEY_ID,
      });
    }

    // Mock order for sandbox / local test when test credentials are dummy
    console.warn('⚠️ Razorpay keys are placeholders. Generating test mock order for frontend checkout.');
    const mockOrderId = `order_mock_${Date.now()}`;
    return res.json({
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyIdHere',
      isMock: true,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({ error: 'Failed to create Razorpay order.' });
  }
}

/**
 * POST /api/orders/verify
 * Server-side Razorpay signature verification & order recording
 */
export async function verifyAndSavePaymentOrder(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      items,
      shippingAddress,
      subtotal,
      discount = 0,
      tax = 0,
      shippingFee = 0,
      totalAmount,
      isMock = false,
    } = req.body;

    if (!customer || !customer.email || !customer.phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required customer or items details.' });
    }

    // Strict Indian Phone Validation
    const phoneVal = validateIndianPhoneNumber(customer.phone);
    if (!phoneVal.isValid) {
      return res.status(400).json({ error: phoneVal.error });
    }

    // Server-side HMAC Signature Verification
    if (razorpayInstance && !isMock) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        console.error('❌ Razorpay signature mismatch! Potential fraudulent payment.');
        return res.status(400).json({ error: 'Payment verification failed: Invalid signature.' });
      }
    }

    const orderId = generateOrderId();
    const cleanPhone = phoneVal.normalizedPhone;

    const orderData = {
      id: orderId,
      user_id: customer.userId || null,
      customer_name: customer.name || 'Valued Customer',
      customer_email: customer.email.toLowerCase().trim(),
      customer_phone: cleanPhone,
      shipping_address: shippingAddress,
      subtotal: Number(subtotal),
      discount: Number(discount),
      tax: Number(tax),
      shipping_fee: Number(shippingFee),
      total_amount: Number(totalAmount),
      payment_method: 'razorpay',
      payment_status: 'paid',
      order_status: 'placed',
      razorpay_order_id: razorpay_order_id || null,
      razorpay_payment_id: razorpay_payment_id || null,
      created_at: new Date().toISOString(),
    };

    // Save in Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error: orderError } = await supabase.from('orders').insert([orderData]);
        if (orderError) {
          console.warn('⚠️ Supabase order insert error:', orderError.message);
        } else {
          // Insert order items
          const formattedItems = items.map(item => ({
            order_id: orderId,
            product_id: item.id || item.productId,
            product_name: item.name || item.productName,
            price: Number(item.price),
            quantity: Number(item.quantity),
            size: item.size || 'M',
            color: item.color || '',
            image: item.image || '',
          }));

          const { error: itemsError } = await supabase.from('order_items').insert(formattedItems);
          if (itemsError) {
            console.warn('⚠️ Supabase order_items insert error:', itemsError.message);
          }
        }
      } catch (dbErr) {
        console.warn('⚠️ Supabase order exception:', dbErr.message);
      }
    }

    // Save in memory
    memoryOrders.unshift({ ...orderData, items });

    // Send real Order Confirmation Email
    await sendOrderConfirmationEmail(orderData, items);

    return res.status(201).json({
      success: true,
      message: 'Payment verified and order placed successfully.',
      order: { ...orderData, items },
    });
  } catch (error) {
    console.error('Order verification error:', error);
    return res.status(500).json({ error: 'Failed to complete order.' });
  }
}

/**
 * POST /api/orders/cod
 * Create Cash on Delivery (COD) order
 */
export async function createCodOrder(req, res) {
  try {
    const {
      customer,
      items,
      shippingAddress,
      subtotal,
      discount = 0,
      tax = 0,
      shippingFee = 0,
      totalAmount,
    } = req.body;

    if (!customer || !customer.email || !customer.phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing customer or cart items.' });
    }

    // Strict Indian Phone Validation
    const phoneVal = validateIndianPhoneNumber(customer.phone);
    if (!phoneVal.isValid) {
      return res.status(400).json({ error: phoneVal.error });
    }

    const orderId = generateOrderId();
    const cleanPhone = phoneVal.normalizedPhone;

    const orderData = {
      id: orderId,
      user_id: customer.userId || null,
      customer_name: customer.name || 'Valued Customer',
      customer_email: customer.email.toLowerCase().trim(),
      customer_phone: cleanPhone,
      shipping_address: shippingAddress,
      subtotal: Number(subtotal),
      discount: Number(discount),
      tax: Number(tax),
      shipping_fee: Number(shippingFee),
      total_amount: Number(totalAmount),
      payment_method: 'cod',
      payment_status: 'pending',
      order_status: 'placed',
      created_at: new Date().toISOString(),
    };

    // Save in Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error: orderError } = await supabase.from('orders').insert([orderData]);
        if (orderError) {
          console.warn('⚠️ Supabase order insert error:', orderError.message);
        } else {
          const formattedItems = items.map(item => ({
            order_id: orderId,
            product_id: item.id || item.productId,
            product_name: item.name || item.productName,
            price: Number(item.price),
            quantity: Number(item.quantity),
            size: item.size || 'M',
            color: item.color || '',
            image: item.image || '',
          }));
          await supabase.from('order_items').insert(formattedItems);
        }
      } catch (err) {
        console.warn('⚠️ Supabase COD order exception:', err.message);
      }
    }

    // Save in memory
    memoryOrders.unshift({ ...orderData, items });

    // Send real Order Confirmation Email
    await sendOrderConfirmationEmail(orderData, items);

    return res.status(201).json({
      success: true,
      message: 'COD order placed successfully.',
      order: { ...orderData, items },
    });
  } catch (error) {
    console.error('COD order creation error:', error);
    return res.status(500).json({ error: 'Failed to create COD order.' });
  }
}

/**
 * GET /api/orders/my-orders
 * Fetch customer orders by email or authenticated user
 */
export async function getMyOrders(req, res) {
  try {
    const email = req.query.email?.toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ error: 'Customer email is required.' });
    }

    let orders = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('customer_email', email)
          .order('created_at', { ascending: false });

        if (!error && dbOrders && dbOrders.length > 0) {
          orders = dbOrders.map(o => ({
            ...o,
            items: o.order_items || [],
          }));
        }
      } catch (err) {
        console.warn('⚠️ Supabase order fetch error:', err.message);
      }
    }

    if (orders.length === 0) {
      orders = memoryOrders.filter(o => o.customer_email === email);
    }

    return res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
}

/**
 * GET /api/orders/:id
 * Fetch single order status and details
 */
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    let order = null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbOrder, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('id', id)
          .maybeSingle();

        if (!error && dbOrder) {
          order = {
            ...dbOrder,
            items: dbOrder.order_items || [],
          };
        }
      } catch (err) {
        console.warn('⚠️ Supabase single order fetch error:', err.message);
      }
    }

    if (!order) {
      order = memoryOrders.find(o => o.id === id);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch order.' });
  }
}
