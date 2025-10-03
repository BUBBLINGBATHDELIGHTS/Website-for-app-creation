import React, { createContext, useContext, useMemo, useReducer } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  discounts: [],
  customer: null,
  gamification: {
    points: 0,
    tier: 'Newcomer',
    nextRewardProgress: 0
  }
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((item) => item.id === action.payload.id);
      const updatedItems = existing
        ? state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        : [...state.items, action.payload];

      return {
        ...state,
        items: updatedItems
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload)
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'APPLY_DISCOUNT':
      if (state.discounts.find((discount) => discount.code === action.payload.code)) {
        return state;
      }
      return {
        ...state,
        discounts: [...state.discounts, action.payload]
      };
    case 'SET_CUSTOMER':
      return {
        ...state,
        customer: action.payload
      };
    case 'AWARD_POINTS':
      return {
        ...state,
        gamification: {
          ...state.gamification,
          points: state.gamification.points + action.payload.points,
          nextRewardProgress: action.payload.nextRewardProgress ?? state.gamification.nextRewardProgress,
          tier: action.payload.tier ?? state.gamification.tier
        }
      };
    case 'RESET_CART':
      return {
        ...initialState,
        gamification: state.gamification,
        customer: state.customer,
        discounts: state.discounts
      };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
