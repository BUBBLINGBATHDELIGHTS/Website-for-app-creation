import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

const steps = ['Contact', 'Shipping', 'Payment'];

export default function CheckoutFlow({ open, onClose }) {
  const { state, dispatch } = useCart();
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
    cardLast4: '4242'
  });

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
      cardLast4: '4242'
    });
    onClose();
  };

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountRate = state.discounts.reduce((sum, discount) => sum + (discount.amount || 0), 0);
  const discount = subtotal * discountRate;
  const total = subtotal - discount;
  const hasItems = state.items.length > 0;

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
          hasAccount: Boolean(state.customer?.hasAccount)
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
        }
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
                  <Dialog.Title className="text-lg font-semibold text-charcoal">
                    Secure Checkout
                  </Dialog.Title>
                  <p className="text-sm text-gray-500">
                    Complete your order and earn fizz points for future rewards.
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
                        {index < steps.length - 1 && (
                          <span className="h-px w-8 bg-gray-200" aria-hidden="true"></span>
                        )}
                      </div>
                    ))}
                  </nav>

                  {error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
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
                            placeholder="Bathville"
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
                            placeholder="90210"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="grid gap-4">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600 flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-lavender" />
                        <span>Payments are securely processed via Stripe.</span>
                      </div>
                      <label className="grid gap-1 text-sm font-medium text-charcoal">
                        Cardholder name
                        <input
                          type="text"
                          required
                          value={form.cardHolder}
                          onChange={(event) => setForm((prev) => ({ ...prev, cardHolder: event.target.value }))}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                          placeholder="Name on card"
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-medium text-charcoal">
                        Last 4 digits
                        <input
                          type="text"
                          maxLength={4}
                          required
                          value={form.cardLast4}
                          onChange={(event) => setForm((prev) => ({ ...prev, cardLast4: event.target.value }))}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-mint focus:outline-none"
                          placeholder="4242"
                        />
                      </label>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  {activeStep >= steps.length ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-mint" />
                        <div>
                          <p className="font-semibold text-charcoal">Order confirmed!</p>
                          <p className="text-sm text-gray-500">
                            Track your order status in the profile tab or bookmark the tracking page.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-full bg-lavender px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#a696dd]"
                        onClick={handleClose}
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total due</p>
                        <p className="text-xl font-semibold text-charcoal">${total.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                          onClick={handleClose}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={loading || !hasItems}
                          className="flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6FA897] disabled:bg-gray-300"
                          onClick={() => {
                            if (activeStep < steps.length - 1) {
                              setActiveStep((prev) => prev + 1);
                            } else {
                              handleSubmit();
                            }
                          }}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
                        </button>
                      </div>
                    </div>
                  )}
                  {!hasItems && activeStep < steps.length && (
                    <p className="mt-2 text-xs text-red-500">Add at least one product to continue to checkout.</p>
                  )}
                  {orderId && (
                    <p className="mt-2 text-xs text-gray-500">
                      Order #{orderId} created. A confirmation email has been sent to {form.email || 'your inbox'}.
                    </p>
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
