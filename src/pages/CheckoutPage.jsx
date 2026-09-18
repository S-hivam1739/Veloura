import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Banknote, AlertCircle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { validateIndianPhone } from '../utils/phoneValidator';
import { api } from '../utils/api';

export default function CheckoutPage({ onOrderSuccess, onViewCatalogue }) {
  const { items, subtotal, shippingFee, tax, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [customer, setCustomer] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [phoneValidation, setPhoneValidation] = useState(() => validateIndianPhone(user?.phone || ''));
  const [phoneTouched, setPhoneTouched] = useState(Boolean(user?.phone));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR'
  ];

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setCustomer(prev => ({ ...prev, phone: val }));
    setPhoneTouched(true);
    const result = validateIndianPhone(val);
    setPhoneValidation(result);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    // Strict Indian Phone Validation
    const pVal = validateIndianPhone(customer.phone);
    if (!pVal.isValid) {
      setErrorMsg(`Phone Error: ${pVal.error}`);
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      setErrorMsg('PIN code must be exactly 6 numeric digits.');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'cod') {
        // Cash on Delivery Order
        const res = await api.createCodOrder({
          customer: {
            userId: user?.id,
            name: customer.name,
            email: customer.email,
            phone: pVal.phone,
          },
          items,
          shippingAddress,
          subtotal,
          shippingFee,
          tax,
          totalAmount,
        });

        if (res.success && res.order) {
          clearCart();
          onOrderSuccess(res.order);
        }
      } else {
        // Razorpay Online Payment Flow
        const orderData = await api.createRazorpayOrder({
          amount: totalAmount,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
        });

        if (!orderData.success) {
          throw new Error('Could not initialize Razorpay payment.');
        }

        // Open Razorpay SDK modal
        if (typeof window.Razorpay === 'function' && !orderData.isMock) {
          const rzp = new window.Razorpay({
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Veloura Fashion',
            description: 'Veloura Garments Purchase',
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80',
            order_id: orderData.orderId,
            prefill: {
              name: customer.name,
              email: customer.email,
              contact: pVal.phone,
            },
            theme: {
              color: '#121212',
            },
            handler: async function (response) {
              try {
                // Verify signature on backend!
                const verifyRes = await api.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  customer: {
                    userId: user?.id,
                    name: customer.name,
                    email: customer.email,
                    phone: pVal.phone,
                  },
                  items,
                  shippingAddress,
                  subtotal,
                  shippingFee,
                  tax,
                  totalAmount,
                });

                if (verifyRes.success && verifyRes.order) {
                  clearCart();
                  onOrderSuccess(verifyRes.order);
                }
              } catch (verifyErr) {
                setErrorMsg('Payment verification failed on server: ' + verifyErr.message);
              }
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
              },
            },
          });

          rzp.on('payment.failed', function (resp) {
            setErrorMsg('Payment failed: ' + (resp.error?.description || 'Transaction canceled.'));
            setLoading(false);
          });

          rzp.open();
        } else {
          // Sandbox / Mock simulation when Razorpay test keys are dummy
          console.log('Simulating Razorpay payment completion...');
          const mockPaymentId = `pay_mock_${Date.now()}`;
          const verifyRes = await api.verifyPayment({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: 'mock_signature_for_sandbox',
            isMock: true,
            customer: {
              userId: user?.id,
              name: customer.name,
              email: customer.email,
              phone: pVal.phone,
            },
            items,
            shippingAddress,
            subtotal,
            shippingFee,
            tax,
            totalAmount,
          });

          if (verifyRes.success && verifyRes.order) {
            clearCart();
            onOrderSuccess(verifyRes.order);
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-20 p-10 bg-white rounded-xl border border-veloura-sand text-center space-y-4 shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-veloura-dark">Your bag is empty</h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Please add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={onViewCatalogue}
          className="px-6 py-3 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-widest rounded"
        >
          Explore Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-veloura-dark uppercase tracking-wide">
          Checkout
        </h1>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">
          Secure Order Processing • Supabase Database • Razorpay Verification
        </p>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 7 Columns: Details & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Customer Information */}
          <div className="bg-white p-6 rounded-xl border border-veloura-sand shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-veloura-dark border-b border-neutral-100 pb-3">
              1. Customer Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block uppercase font-bold tracking-wider text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Aarav Sharma"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold"
                />
              </div>

              <div>
                <label className="block uppercase font-bold tracking-wider text-neutral-700 mb-1">
                  Email Address (For Order Confirmation Receipt)
                </label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="aarav@example.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold"
                />
              </div>

              {/* Strict Indian Mobile Number */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block uppercase font-bold tracking-wider text-neutral-700">
                    Indian Mobile Number
                  </label>
                  <span className="text-[10px] text-neutral-400">10 digits</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 font-semibold">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={handlePhoneChange}
                    placeholder="9876543210"
                    maxLength={13}
                    className={`w-full pl-12 pr-10 py-2.5 bg-neutral-50 border rounded-lg text-neutral-900 focus:outline-none ${
                      phoneTouched
                        ? phoneValidation.isValid
                          ? 'border-emerald-500'
                          : 'border-red-400'
                        : 'border-neutral-300 focus:border-veloura-gold'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {phoneTouched && (
                      phoneValidation.isValid ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={16} className="text-red-500" />
                      )
                    )}
                  </div>
                </div>
                {phoneTouched && !phoneValidation.isValid && (
                  <p className="text-[10px] text-red-600 mt-1">
                    {phoneValidation.error}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="bg-white p-6 rounded-xl border border-veloura-sand shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-veloura-dark border-b border-neutral-100 pb-3">
              2. Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block uppercase font-bold tracking-wider text-neutral-700 mb-1">
                  Street Address & Apartment
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  placeholder="Flat 402, Royal Palms, Bandra West"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold"
                />
              </div>

              <div>
                <label className="block uppercase font-bold tracking-wider text-neutral-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold"
                />
              </div>

              <div>
                <label className="block uppercase font-bold tracking-wider text-neutral-700 mb-1">
                  State
                </label>
                <select
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase font-bold tracking-wider text-neutral-700 mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="400050"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-veloura-gold"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white p-6 rounded-xl border border-veloura-sand shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-veloura-dark border-b border-neutral-100 pb-3">
              3. Payment Method
            </h2>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition ${
                  paymentMethod === 'razorpay'
                    ? 'border-veloura-dark bg-veloura-cream/60'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-veloura-dark focus:ring-veloura-gold"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-veloura-dark flex items-center gap-2">
                      <CreditCard size={18} className="text-veloura-gold" />
                      Razorpay Secure Payment
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Instant & Encrypted
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Pay securely with UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking & Wallets.
                  </p>
                </div>
              </label>

              {/* Cash On Delivery Option */}
              <label
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-veloura-dark bg-veloura-cream/60'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-veloura-dark focus:ring-veloura-gold"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-veloura-dark flex items-center gap-2">
                      <Banknote size={18} className="text-veloura-gold" />
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] text-neutral-500">Pay at Doorstep</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Pay via cash or UPI to the courier upon delivery.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-veloura-sand shadow-sm space-y-6">
            <h2 className="font-serif text-lg font-bold text-veloura-dark border-b border-neutral-100 pb-3">
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </h2>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-16 object-cover rounded bg-veloura-sand/30 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-neutral-900 line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-neutral-400">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-neutral-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Delivery</span>
                <span className="font-semibold text-neutral-900">
                  {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (5%)</span>
                <span className="font-semibold text-neutral-900">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-200 text-sm font-bold text-veloura-dark">
                <span>Total Due</span>
                <span className="text-lg text-veloura-dark">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={loading || (phoneTouched && !phoneValidation.isValid)}
              className="w-full py-4 bg-veloura-dark text-veloura-sand text-xs uppercase font-bold tracking-[0.2em] rounded-lg shadow-lg hover:bg-veloura-charcoal transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Securing Order...</span>
              ) : (
                <>
                  <Lock size={14} />
                  <span>
                    {paymentMethod === 'razorpay' ? `Pay ₹${totalAmount.toLocaleString('en-IN')} via Razorpay` : 'Confirm COD Order'}
                  </span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[10px] text-neutral-400 space-y-1">
              <p>🔒 256-Bit SSL Encrypted Razorpay Checkout</p>
              <p>An official receipt will be emailed immediately after confirmation.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
