import React, { useEffect, useState } from 'react';
import {
  CartItemDto,
  CategoriaDto,
  OrderTrackingDto,
  ProductDto,
  ViewRoute,
} from './types/models';
import { ChocolatesSvApi } from './services/dotnetApi';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { ContactView, StoryView } from './views/StoryAndContactView';
import { FaqView } from './views/FaqView';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>('home');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoriaDto[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  const [cartItems, setCartItems] = useState<CartItemDto[]>([]);

  const [activeOrder, setActiveOrder] = useState<OrderTrackingDto | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  useEffect(() => {
    Promise.all([ChocolatesSvApi.getAllProducts(), ChocolatesSvApi.getCategories()])
      .then(([loadedProducts, loadedCategories]) => {
        setCategories(loadedCategories);
        setProducts(loadedProducts.map((product) => ({
          ...product,
          category: loadedCategories.find((category) => category.id === product.idCategoria)?.nombre || product.category,
        })));
      })
      .catch((error) => showToast(error.message));
  }, []);

  const handleNavigate = (route: ViewRoute) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentRoute('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: ProductDto, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { productId: product.id, product, quantity }];
    });
    showToast(`${product.name} añadido a tu selección`);
    setCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const totalCartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-md antialiased">
      <Navbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-grow">
        {currentRoute === 'home' && (
          <HomeView
            products={products}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentRoute === 'catalog' && (
          <CatalogView
            products={products}
              categories={categories}
            searchQuery={searchQuery}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentRoute === 'product-detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentRoute === 'checkout' && (
          <CheckoutView
            items={cartItems}
            onOrderCompleted={(createdOrder) => {
              setActiveOrder(createdOrder);
              setCartItems([]);
              handleNavigate('order-tracking');
              showToast(`Pedido #${createdOrder.orderNumber} confirmado`);
            }}
          />
        )}

        {currentRoute === 'order-tracking' && (
          <OrderTrackingView
            order={activeOrder}
            onOrderFound={(foundOrder) => {
              setActiveOrder(foundOrder);
              showToast(`Pedido #${foundOrder.orderNumber} cargado`);
            }}
          />
        )}

        {currentRoute === 'story' && <StoryView onNavigate={handleNavigate} />}

        {currentRoute === 'contact' && <ContactView />}

        {currentRoute === 'faq' && <FaqView />}
      </main>

      <Footer onNavigate={handleNavigate} />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setCartOpen(false);
          handleNavigate('checkout');
        }}
        onSelectProduct={handleSelectProduct}
      />

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-secondary-fixed px-6 py-3 rounded shadow-xl border border-secondary/40 flex items-center gap-2.5 text-sm font-body-md">
          <span className="material-symbols-outlined text-base text-secondary-fixed">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
