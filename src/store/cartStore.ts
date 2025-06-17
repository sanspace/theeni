// src/store/cartStore.ts
import { create } from 'zustand';
import { type Item, type Customer } from '../types';

export interface CartItem extends Item {
  quantity: number; // Quantity will now represent kg
}

interface CartState {
  cart: CartItem[];
  discountPercentage: number;
  customer: Customer | null;

  // actions
  upsertItem: (item: Item, quantity: number) => void; // "upsert" = update or insert
  removeItem: (itemId: number) => void;
  incrementItem: (itemId: number) => void;
  decrementItem: (itemId: number) => void;
  applyDiscount: (percentage: number) => void;
  setCustomer: (customer: Customer | null) => void;
  clearCart: () => void;
}

const MINIMUM_QTY_STEP = 0.25;

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  discountPercentage: 0,
  customer: null,

  upsertItem: (item, quantity) => {
    const { cart } = get();
    const itemExists = cart.find((cartItem) => cartItem.id === item.id);

    if (itemExists) {
      // If item exists, update its quantity by adding the new quantity
      const updatedCart = cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      );
      set({ cart: updatedCart });
    } else {
      // If item is new, add it with the specified quantity
      const updatedCart = [...cart, { ...item, quantity }];
      set({ cart: updatedCart });
    }
  },

  // Action to completely remove an item from the cart
  removeItem: (itemId) => {
    set({ cart: get().cart.filter((cartItem) => cartItem.id !== itemId) });
  },

  incrementItem: (itemId) => {
    const { cart } = get();
    const updatedCart = cart.map((cartItem) =>
      cartItem.id === itemId
        ? { ...cartItem, quantity: cartItem.quantity + MINIMUM_QTY_STEP }
        : cartItem
    );
    set({ cart: updatedCart });
  },


  decrementItem: (itemId) => {
    const { cart } = get();
    const targetItem = cart.find((cartItem) => cartItem.id === itemId);

    // If decreasing makes the quantity zero or less, remove the item
    if (targetItem && targetItem.quantity - MINIMUM_QTY_STEP <= 0) {
      get().removeItem(itemId);
    } else {
      // Otherwise, just decrease the quantity
      const updatedCart = cart.map((cartItem) =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - MINIMUM_QTY_STEP }
          : cartItem
      );
      set({ cart: updatedCart });
    }
  },

  applyDiscount: (percentage) => {
    if (percentage >= 0 && percentage <= 100) {
      set({ discountPercentage: percentage });
    }
  },

  setCustomer: (customer) => {
    set({ customer });
  },

  clearCart: () => {
    set({ cart: [], discountPercentage: 0, customer: null });
  },

}));

export const selectSubTotal = (state: CartState) => 
  state.cart.reduce((total, item) => total + item.price * item.quantity, 0);

export const selectDiscountableSubTotal = (state: CartState) =>
  state.cart
    .filter(item => item.is_discount_eligible)
    .reduce((total, item) => total + item.price * item.quantity, 0);

export const selectDiscountAmount = (state: CartState) => {
  const discountableSubTotal = selectDiscountableSubTotal(state);
  return (discountableSubTotal * state.discountPercentage) / 100;
};

export const selectFinalTotal = (state: CartState) => {
  const subTotal = selectSubTotal(state);
  const discountAmount = selectDiscountAmount(state);
  return subTotal - discountAmount;
};
