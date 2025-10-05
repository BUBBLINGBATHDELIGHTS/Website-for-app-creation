import { Fragment, useEffect, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

const steps = ['Contact', 'Shipping', 'Payment'];

export default function CheckoutFlow({ open, onClose }) {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    postalCode: '',
    cardHolder: '',
    cardLast4: '4242',
    createAccount: !state.customer?.hasAccount,
    password: '',
    wantsMarketing: true,
    discountCode: ''
  });

  useEffect(() => {
    if (open) {
      setForm((prev) => ({ ...prev, createAccount: !state.customer?.hasAccount }));
    }
  }, [open, state.customer?.hasAccount]);

  const subtotal = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [state.items]
  );
  const manualDiscount = useMemo(
    () => state.discounts.reduce((sum, discount) => sum + subtotal * (discount.amount || 0), 0),
    [state.discounts, subtotal]
  );
  const loyaltyEligible = form.createAccount || state.customer?.hasAccount;
  const loyaltyDiscount = loyaltyEligible ? subtotal * 0.1 : 0;
  const discount = manualDiscount + loyaltyDiscount;
  const total = Math.max(0, subtotal - discount);
  const hasItems = state.items.length > 0;

  const canAdvance = () => {
    if (activeStep === 0) {
      return Boolean(form.email && form.name);
    }
    if (activeStep === 1) {
      const hasAddress = form.address && form.city && form.postalCode;
      const hasPassword = !form.createAccount || form.password.length >= 6;
      return Boolean(hasAddress && hasPassword);
    }
    if (activeStep === 2) {
      return Boolean(form.cardHolder && form.cardLast4.length === 4);
    }
    return true;
  };

  const handleClose = () => {
    setActiveStep(0);
    setOrderId(null);
    setError(null);
    setForm({
      email: '',
      name: '',
      address: '',
      city: '',
      postalCode: '',
      cardHolder: '',
      cardLast4: '4242',
      createAccount: !state.customer?.hasAccount,
      password: '',
      wantsMarketing: true,
      discountCode: ''
    });
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/orders', {
        customer: {
          email: form.email,
          name: form.name,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          createAccount: form.createAccount,
          password: form.password || undefined,
          wantsMarketing: form.wantsMarketing
        },
        items: state.items,
        payment: {
          brand: 'visa',
          last4: form.cardLast4,
          holder: form.cardHolder
        },
        totals: {
          subtotal,
          discount,
          total
        },
        discountCode: form.discountCode || undefined
      });

      const createdOrder = response.data;
      setOrderId(createdOrder.id);
      dispatch({
        type: 'AWARD_POINTS',
        payload: {
          points: Math.round(total),
          nextRewardProgress: createdOrder.rewardProgress,
          tier: createdOrder.tier
        }
      });
      dispatch({
        type: 'SET_CUSTOMER',
        payload: { email: form.email, hasAccount: form.createAccount || state.customer?.hasAccount }
      });
      dispatch({ type: 'RESET_CART' });
      setActiveStep(steps.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-xl transition-all">
                <div className="px-6 py-5 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-semibold text-charcoal">Secure Checkout</Dialog.Title>
                  <p className="text-sm text-gray-500">
                    {loyaltyEligible
                      ? 'You are earning a 10% loyalty discount with full order tracking.'
                      : 'Guest checkout keeps things quick—add a password to save 10%.'}
                  </p>
                </div>
                <div className="px-6 py-4 space-y-6">
                  <nav className="flex items-center justify-between">
                    {steps.map((step, index) => (
                      <div key={step} className="flex items-center gap-2">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                            index <= activeStep ? 'bg-lavender text-white border-lavender' : 'border-gray-200 text-gray-400'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-charcoal">{step}</span>
                        {index < steps.length - 1 && <span className="h-px w-8 bg-gray-200" aria-hidden="true" />}
                      </div>
                    ))}
                  </nav>

                  {error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                  )}

                  {activeStep === 0 && (
                    <div className="grid gap-4">
                      <label className="grid gap-1 text-sm font-medium text-charcoal">
                        Email
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                          placeholder="you@example.com"
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-charcoal">
                        Full name
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                          placeholder="Bubbly Enthusiast"
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-charcoal">
                        Discount code
                        <input
                          type="text"
                          value={form.discountCode}
                          onChange={(event) => setForm((prev) => ({ ...prev, discountCode: event.target.value }))}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                          placeholder="SPRING10"
                        />
                      </label>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="grid gap-4">
                      <label className="grid gap-1 text-sm font-medium text-charcoal">
                        Address
                        <input
                          type="text"
                          required
                          value={form.address}
                          onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                          placeholder="123 Fizzy Lane"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="grid gap-1 text-sm font-medium text-charcoal">
                          City
                          <input
                            type="text"
                            required
                            value={form.city}
                            onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                          />
                        </label>
                        <label className="grid gap-1 text-sm font-medium text-charcoal">
                          Postal code
                          <input
                            type="text"
                            required
                            value={form.postalCode}
                            onChange={(event) => setForm((prev) => ({ ...prev, postalCode: event.target.value }))}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                          />
                        </label>
                      </div>
                      <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={form.createAccount}
                          onChange={(event) => setForm((prev) => ({ ...prev, createAccount: event.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-lavender"
                        />
                        Create a Bubbling account and save 10% today
                      </label>
                      {form.createAccount && (
                        <label className="grid gap-1 text-sm font-medium text-charcoal">
                          Choose a password
                          <input
                            type="password"
                            required={form.createAccount}
                            value={form.password}
                            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                            placeholder="••••••••"
                          />
                        </label>
                      )}
                      <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={form.wantsMarketing}
                          onChange={(event) => setForm((prev) => ({ ...prev, wantsMarketing: event.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-lavender"
                        />
                        Email me fizz updates and order notifications
                      </label>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="grid gap-4">
                      <label className="grid gap-1 text-sm font-medium text-charcoal">
                        Card holder
                        <input
                          type="text"
                          required
                          value={form.cardHolder}
                          onChange={(event) => setForm((prev) => ({ ...prev, cardHolder: event.target.value }))}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                          placeholder="As shown on card"
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-charcoal">
                        Last four digits
                        <input
                          type="text"
                          required
                          value={form.cardLast4}
                          onChange={(event) => setForm((prev) => ({ ...prev, cardLast4: event.target.value }))}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                          placeholder="4242"
                          maxLength={4}
                        />
                      </label>
                    </div>
                  )}

                  <aside className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-mint">
                      <span>Discounts</span>
                      <span>- ${discount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-charcoal">
                      <span>Total due</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </aside>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStep === 0) {
                        handleClose();
                      } else {
                        setActiveStep((prev) => prev - 1);
                      }
                    }}
                    className="text-sm font-semibold text-gray-500"
                  >
                    {activeStep === 0 ? 'Cancel' : 'Back'}
                  </button>
                  {activeStep >= steps.length ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        if (orderId) {
                          navigate(`/orders/${orderId}`);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-semibold text-white hover:bg-[#6FA897]"
                    >
                      <CheckCircle2 className="h-4 w-4" /> View order status
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!hasItems || loading || !canAdvance()}
                      onClick={() => {
                        if (activeStep === steps.length - 1) {
                          handleSubmit();
                        } else {
                          setActiveStep((prev) => prev + 1);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-lavender px-4 py-2 text-sm font-semibold text-white hover:bg-[#a696dd] disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                      {activeStep === steps.length - 1 ? 'Place order' : 'Continue'}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
