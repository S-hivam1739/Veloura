import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('veloura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('veloura_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, size = 'M', color = '', quantity = 1) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.id === product.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            category: product.category,
            price: Number(product.price),
            originalPrice: Number(product.originalPrice || product.price * 1.3),
            image: product.image,
            size,
            color: color || (product.colors?.[0]?.name || 'Standard'),
            quantity,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, size, color) => {
    setItems(prev =>
      prev.filter(item => !(item.id === id && item.size === size && item.color === color))
    );
  };

  const updateQuantity = (id, size, color, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.id === id && item.size === size && item.color === color) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 999 || items.length === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const totalAmount = subtotal + shippingFee + tax;

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        shippingFee,
        tax,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
