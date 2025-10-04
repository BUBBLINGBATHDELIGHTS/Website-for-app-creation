import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { state, dispatch } = useCart();
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountRate = state.discounts.reduce((sum, discount) => sum + (discount.amount || 0), 0);
  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md bg-white shadow-xl">
                  <div className="flex h-full flex-col overflow-y-scroll">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                      <Dialog.Title className="text-lg font-semibold text-charcoal">Shopping Cart</Dialog.Title>
                      <button
                        type="button"
                        className="rounded-full p-2 hover:bg-gray-100"
                        onClick={onClose}
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                    <div className="flex-1 px-6 py-4 space-y-4">
                      {state.items.length === 0 ? (
                        <p className="text-gray-500 text-sm">Your cart is feeling lonely. Add a bubbly treat!</p>
                      ) : (
                        state.items.map((item) => (
                          <div key={item.id} className="flex items-start gap-4">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-20 w-20 rounded-xl object-cover"
                            />
                            <div className="flex-1 space-y-2">
                              <div>
                                <p className="font-medium text-charcoal">{item.name}</p>
                                <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      dispatch({
                                        type: 'UPDATE_QUANTITY',
                                        payload: { id: item.id, quantity: Math.max(1, item.quantity - 1) }
                                      })
                                    }
                                    className="p-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="text-sm font-semibold">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      dispatch({
                                        type: 'UPDATE_QUANTITY',
                                        payload: { id: item.id, quantity: item.quantity + 1 }
                                      })
                                    }
                                    className="p-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                                  className="p-1 rounded-full text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-t border-gray-200 px-6 py-4 space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex items-center justify-between text-sm text-mint">
                          <span>
                            Savings {state.discounts.map((discount) => discount.code).join(', ')}
                          </span>
                          <span>- ${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between font-semibold text-charcoal">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <button
                        type="button"
                        disabled={state.items.length === 0}
                        className="w-full bg-mint text-white rounded-full py-3 font-semibold shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#6FA897] transition-colors"
                        onClick={onCheckout}
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
