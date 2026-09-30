import React, { useState } from 'react';
import { ViewRoute } from '../types/models';
import { BRAND_ASSETS } from '../data/mockDatabase';
import { SmartImage } from './SmartImage';

interface NavbarProps {
  currentRoute: ViewRoute;
  onNavigate: (route: ViewRoute) => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (currentRoute === 'checkout') {
    return (
      <header className="w-full top-0 sticky bg-surface/95 backdrop-blur-md shadow-[0_4px_20px_rgba(62,39,35,0.08)] z-40">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
            <SmartImage
              src={BRAND_ASSETS.logoColor}
              alt="Chocolates SV Logo"
              className="h-10 w-auto object-contain"
              fallbackLabel="Chocolates SV"
            />
          </button>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="text-caption text-on-surface-variant hover:text-primary transition-colors hidden sm:inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Seguir comprando
            </button>
            <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-secondary">
                lock
              </span>
              Pago Seguro
            </span>
          </div>
        </div>
      </header>
    );
  }

  const navItems: { label: string; route: ViewRoute }[] = [
    { label: 'Inicio', route: 'home' },
    { label: 'Catálogo', route: 'catalog' },
    { label: 'Nuestra Historia', route: 'story' },
    { label: 'Seguimiento', route: 'order-tracking' },
    { label: 'Contacto', route: 'contact' },
    { label: 'Preguntas frecuentes', route: 'faq' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRoute !== 'catalog') {
      onNavigate('catalog');
    }
  };

  return (
    <header className="w-full top-0 sticky bg-surface/95 backdrop-blur-md shadow-[0_4px_20px_rgba(62,39,35,0.08)] z-40 transition-all duration-300">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex-shrink-0 hover:opacity-85 transition-opacity cursor-pointer focus:outline-none"
          aria-label="Ir al inicio de Chocolates SV"
        >
          <SmartImage
            src={BRAND_ASSETS.logoColor}
            alt="Chocolates SV Logo"
            className="h-10 md:h-12 w-auto object-contain"
            fallbackLabel="Chocolates SV"
          />
        </button>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive =
              currentRoute === item.route ||
              (item.route === 'catalog' && currentRoute === 'product-detail');
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => onNavigate(item.route)}
                className={`font-body-md text-body-md whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-secondary border-b-2 border-secondary pb-1 font-semibold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 text-primary">
          {searchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-surface-container-low border border-outline-variant rounded px-3 py-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-lg text-on-surface-variant mr-2">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentRoute !== 'catalog') {
                    onNavigate('catalog');
                  }
                }}
                placeholder="Buscar trufas, cacao..."
                className="bg-transparent border-none focus:outline-none text-sm text-primary placeholder:text-on-surface-variant/60 w-36 sm:w-48"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  onSearchChange('');
                }}
                className="text-on-surface-variant hover:text-primary ml-1 flex items-center cursor-pointer"
                aria-label="Cerrar búsqueda"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar productos"
              className="hover:scale-105 transition-transform duration-200 cursor-pointer active:scale-95 p-2 rounded-full hover:bg-surface-variant/60 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Abrir bolsa de compras"
            className="hover:scale-105 transition-transform duration-200 cursor-pointer active:scale-95 p-2 rounded-full hover:bg-surface-variant/60 relative flex items-center justify-center"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-secondary text-on-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Abrir menú de navegación"
            className="lg:hidden p-2 rounded-full hover:bg-surface-variant/60 text-primary flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-t border-outline-variant/40 px-margin-mobile py-4 space-y-2 shadow-lg">
          {navItems.map((item) => {
            const isActive =
              currentRoute === item.route ||
              (item.route === 'catalog' && currentRoute === 'product-detail');
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => {
                  onNavigate(item.route);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2.5 px-3 rounded font-body-md ${
                  isActive
                    ? 'bg-secondary/10 text-secondary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
