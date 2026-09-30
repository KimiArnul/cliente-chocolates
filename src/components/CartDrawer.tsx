import React from 'react';
import { CartItemDto } from '../types/models';
import { SmartImage } from './SmartImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemDto[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onProceedToCheckout: () => void;
  onSelectProduct: (productId: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onSelectProduct,
}) => {
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const estimatedShipping = items.length > 0 ? 5.0 : 0;
  const total = subtotal + estimatedShipping;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
        aria-label="Cerrar carrito"
      />

      <aside className="fixed inset-y-0 right-0 w-full sm:w-[420px] md:w-[480px] bg-surface-bright shadow-[-10px_0_40px_rgba(39,19,16,0.15)] z-50 flex flex-col">
        <header className="px-gutter py-6 flex justify-between items-center border-b border-surface-variant/60 bg-surface-bright">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-secondary">
              shopping_bag
            </span>
            <h2 className="font-headline-md text-headline-md text-primary tracking-tight">
              Tu Selección
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selección"
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all duration-200 group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">
              close
            </span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto cart-scrollbar px-gutter py-8 flex flex-col gap-8 bg-surface-bright">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center my-auto py-12">
              <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">
                shopping_bag
              </span>
              <h3 className="font-headline-md text-xl text-primary mb-2">
                Tu selección está vacía
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant max-w-xs mb-6">
                Explora nuestras barras de origen único y trufas artesanales
                templadas a mano.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-primary text-secondary-fixed font-label-md text-xs uppercase tracking-widest rounded hover:bg-primary-container transition-colors cursor-pointer"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <>
              {items.map((item, idx) => (
                <React.Fragment key={item.productId}>
                  <div className="flex gap-6 items-start group">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProduct(item.productId);
                        onClose();
                      }}
                      className="w-28 h-28 shrink-0 rounded overflow-hidden relative shadow-[0_2px_10px_rgba(62,39,35,0.06)] border border-surface-variant/30 group-hover:shadow-[0_8px_20px_rgba(62,39,35,0.12)] transition-shadow duration-300 cursor-pointer"
                    >
                      <SmartImage
                        src={item.product.mainImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>

                    <div className="flex-1 flex flex-col justify-between h-28 py-1">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProduct(item.productId);
                              onClose();
                            }}
                            className="font-body-md text-body-md text-primary font-medium leading-tight group-hover:text-secondary transition-colors text-left cursor-pointer"
                          >
                            {item.product.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.productId)}
                            aria-label={`Eliminar ${item.product.name}`}
                            className="text-on-surface-variant hover:text-error transition-colors p-1 -mt-1 -mr-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                        <p className="font-caption text-caption text-on-surface-variant/80">
                          {item.product.weightOrCount}
                        </p>
                      </div>

                      <div className="flex justify-between items-end mt-auto">
                        <span className="font-body-md text-body-md text-primary font-semibold tabular-nums">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>

                        <div className="flex items-center border border-outline-variant rounded overflow-hidden bg-surface shadow-sm">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, -1)}
                            aria-label="Disminuir cantidad"
                            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-container transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              remove
                            </span>
                          </button>
                          <span className="w-8 text-center font-label-md text-label-md text-primary tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, 1)}
                            aria-label="Aumentar cantidad"
                            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-container transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              add
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {idx < items.length - 1 && (
                    <hr className="border-surface-variant/50 w-3/4 mx-auto" />
                  )}
                </React.Fragment>
              ))}

              <div className="mt-2 p-4 bg-surface-container-low rounded border border-secondary/15 flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5 fill">
                  auto_awesome
                </span>
                <div>
                  <h4 className="font-label-md text-label-md text-primary mb-1">
                    Recomendación del Chocolatier
                  </h4>
                  <p className="text-caption text-on-surface-variant italic font-display tracking-wide leading-relaxed">
                    &ldquo;Acompañe sus trufas Noche Mágica con un vino tinto
                    robusto o un espresso de especialidad para realzar sus notas
                    oscuras.&rdquo;
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="bg-surface-container py-6 px-gutter border-t border-surface-variant/80 shadow-[0_-4px_20px_rgba(62,39,35,0.05)] relative z-10">
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-medium text-primary tabular-nums">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Envío Estimado</span>
                <span className="font-medium text-primary tabular-nums">
                  ${estimatedShipping.toFixed(2)}
                </span>
              </div>
              <hr className="border-outline-variant/40 my-1" />
              <div className="flex justify-between items-end">
                <span className="font-body-lg text-body-lg text-primary font-medium">
                  Total
                </span>
                <span className="font-headline-md text-headline-md text-primary tabular-nums">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full bg-primary text-secondary-fixed font-label-md text-label-md py-4 px-6 rounded flex items-center justify-center gap-3 hover:bg-primary-container transition-all duration-300 border border-secondary/40 shadow-[0_4px_15px_rgba(62,39,35,0.2)] hover:shadow-[0_6px_20px_rgba(62,39,35,0.3)] hover:-translate-y-0.5 group cursor-pointer"
            >
              <span className="tracking-widest uppercase text-sm">
                Proceder al Checkout
              </span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform duration-300">
                arrow_forward
              </span>
            </button>

            <p className="text-center mt-4 font-caption text-caption text-on-surface-variant/70 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                lock
              </span>
              Pago seguro garantizado
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};
