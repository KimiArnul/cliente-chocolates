import React, { useState } from 'react';
import { OrderTrackingDto } from '../types/models';
import { ChocolatesSvApi } from '../services/dotnetApi';
import { SmartImage } from '../components/SmartImage';

interface OrderTrackingViewProps {
  order: OrderTrackingDto | null;
  onOrderFound: (order: OrderTrackingDto) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  order,
  onOrderFound,
}) => {
  const viewOrder = order || {
    orderNumber: '', placedDate: '', statusLabel: '',
    shippingAddress: { recipientName: '', line1: '', cityStateZip: '' },
    steps: [], items: [], subtotal: 0, shippingCost: 0, total: 0, bannerImage: '',
  };
  const [lookupOrderNumber, setLookupOrderNumber] = useState(viewOrder.orderNumber);
  const [lookupEmail, setLookupEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lookupFeedback, setLookupFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [conciergeModalOpen, setConciergeModalOpen] = useState(false);
  const [conciergeMessage, setConciergeMessage] = useState('');
  const [conciergeSent, setConciergeSent] = useState(false);
  const [simulatedDelivered, setSimulatedDelivered] = useState(false);

  // Consume POST /api/orders/tracking (Programador 4 API)
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupOrderNumber.trim() || !lookupEmail.trim()) return;

    setIsSearching(true);
    setLookupFeedback(null);

    try {
      const foundOrder = await ChocolatesSvApi.trackOrder(
        lookupOrderNumber,
        lookupEmail
      );
      onOrderFound(foundOrder);
      setLookupFeedback({ success: true, message: 'Pedido localizado y actualizado con éxito.' });
    } catch (error) {
      setLookupFeedback({
        success: false,
        message: error instanceof Error ? error.message : 'No se encontró el pedido.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConciergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conciergeMessage.trim()) return;
    setConciergeSent(true);
    setConciergeMessage('');
  };

  const steps = viewOrder.steps.map((step) => {
    if (simulatedDelivered) {
      return {
        ...step,
        status: 'completed' as const,
        timestamp:
          step.id === 'step-delivered'
            ? 'Entregado Hoy, 16:40 PM'
            : step.timestamp,
      };
    }
    return step;
  });

  return (
    <div className="flex-grow flex flex-col items-center w-full px-margin-mobile md:px-margin-desktop py-14 md:py-24 max-w-container-max mx-auto relative">
      {/* Page Header (Matches Image 4: Seguimiento de Pedido) */}
      <div className="w-full text-center mb-10">
        <p className="font-label-md text-label-md text-secondary/80 uppercase tracking-widest mb-2">
          Estado del Envío
        </p>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
          Seguimiento de Pedido
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto tabular-nums">
           Pedido #{viewOrder.orderNumber} • Realizado el {viewOrder.placedDate}
        </p>
      </div>

      {/* Guest Tracking Form: POST /api/orders/tracking */}
      <div className="w-full max-w-3xl mb-12 bg-surface-container-lowest rounded-xl p-6 ambient-shadow border border-secondary/20">
        <div className="mb-4">
          <h3 className="font-headline-md text-lg text-primary">
            Consultar otro pedido (Modalidad Invitado)
          </h3>
          <p className="text-caption text-on-surface-variant">
            Ingresa el <strong>Número de Orden</strong> y el{' '}
            <strong>Correo Electrónico</strong> registrado al realizar la
            compra para consultar el estado de su orden con nuestro sistema.
          </p>
        </div>

        <form
          onSubmit={handleTrackSubmit}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-5">
            <input
              type="text"
              required
              value={lookupOrderNumber}
              onChange={(e) => setLookupOrderNumber(e.target.value)}
              placeholder="Número de orden"
              className="w-full border border-outline-variant/60 rounded px-3 py-2.5 text-sm bg-surface-container-low focus:border-secondary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-5">
            <input
              type="email"
              required
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full border border-outline-variant/60 rounded px-3 py-2.5 text-sm bg-surface-container-low focus:border-secondary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full h-full min-h-[42px] bg-primary text-secondary-fixed hover:bg-primary-container px-4 py-2 rounded text-xs font-label-md uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              {isSearching ? (
                <span>Buscando...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">
                    search
                  </span>
                  <span>Consultar</span>
                </>
              )}
            </button>
          </div>
        </form>

        {lookupFeedback && (
          <p
            className={`text-caption mt-3 flex items-center gap-1 ${
              lookupFeedback.success ? 'text-success' : 'text-error'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {lookupFeedback.success ? 'check_circle' : 'error'}
            </span>
            <span>{lookupFeedback.message}</span>
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-outline-variant/30 flex flex-wrap justify-between items-center gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSimulatedDelivered((prev) => !prev)}
              className="text-caption text-primary border border-outline-variant/70 hover:border-primary px-3 py-1 rounded-full transition-colors cursor-pointer"
            >
              {simulatedDelivered
                ? 'Ver estado: En Camino'
                : 'Simular entrega completada'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Tracking & Details */}
        <div className="lg:col-span-7 flex flex-col space-y-10">
          {/* Progress Tracker Glassmorphism Card */}
          <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-xl p-8 ambient-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success to-surface-variant" />
            <h2 className="font-headline-md text-headline-md text-primary mb-8 border-b border-outline-variant/30 pb-4">
              Progreso del Envío
            </h2>

            <div className="relative">
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-surface-variant -z-10" />
              <div
                className={`absolute left-8 top-8 w-0.5 bg-success -z-10 transition-all duration-700 ${
                  simulatedDelivered ? 'h-[85%]' : 'h-[55%]'
                }`}
              />

              <div className="space-y-10">
                {steps.map((step) => {
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';
                  const isPending = step.status === 'pending';

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start group ${
                        isPending ? 'opacity-55' : ''
                      }`}
                    >
                      <div className="w-16 flex justify-center mt-1 shrink-0">
                        {isCompleted && (
                          <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-on-primary shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">
                              check
                            </span>
                          </div>
                        )}
                        {isCurrent && (
                          <div className="w-8 h-8 rounded-full bg-surface border-2 border-secondary flex items-center justify-center text-secondary shadow-md relative">
                            <div className="absolute -inset-1 bg-secondary/20 rounded-full animate-ping opacity-75" />
                            <span className="material-symbols-outlined text-[18px]">
                              {step.icon}
                            </span>
                          </div>
                        )}
                        {isPending && (
                          <div className="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center text-outline">
                            <span className="material-symbols-outlined text-[18px]">
                              {step.icon}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <h3
                          className={`font-body-lg text-[18px] font-semibold ${
                            isPending
                              ? 'text-on-surface-variant'
                              : 'text-primary'
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant tabular-nums">
                          {step.timestamp}
                        </p>
                        {step.description && !isPending && (
                          <p className="font-caption text-caption text-outline mt-1">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-4 text-primary">
                  <span className="material-symbols-outlined mr-2">
                    contact_support
                  </span>
                  <h3 className="font-headline-md text-[20px]">
                    ¿Necesitas Ayuda?
                  </h3>
                </div>
                <p className="font-body-md text-on-surface-variant mb-4 text-sm leading-relaxed">
                  Si tienes alguna duda sobre tu envío isotérmico, nuestro
                  concierge está disponible.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConciergeSent(false);
                  setConciergeModalOpen(true);
                }}
                className="w-full py-3 px-4 border border-primary/20 text-primary font-label-md text-xs hover:bg-primary hover:text-on-primary transition-colors duration-300 rounded-sm cursor-pointer"
              >
                Contactar Concierge
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Image Focus */}
        <div className="lg:col-span-5 flex flex-col space-y-8">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow flex flex-col">
            <div className="h-64 w-full relative">
              <SmartImage
                src={viewOrder.bannerImage}
                alt="Caja artesanal Chocolates SV"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent flex items-end p-6">
                <h2 className="font-headline-md text-headline-md text-on-primary">
                  Resumen del Pedido
                </h2>
              </div>
            </div>

            <div className="p-6">
              <ul className="space-y-4 mb-6">
                {viewOrder.items.map((item, idx) => (
                  <li
                    key={`${item.productId}-${idx}`}
                    className="flex justify-between items-start gap-4"
                  >
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-surface-container-highest rounded-md flex-shrink-0 mr-4 overflow-hidden">
                        <SmartImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-body-lg text-[16px] text-primary font-medium">
                          {item.name}
                        </h4>
                        <p className="font-caption text-caption text-outline tabular-nums">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-body-md text-primary tabular-nums">
                      $
                      {item.lineTotal.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-outline-variant/30 pt-4 space-y-2">
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="tabular-nums">
                    $
                    {viewOrder.subtotal.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>Envío Premium</span>
                  <span className="tabular-nums">
                    $
                    {viewOrder.shippingCost.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between font-headline-md text-[20px] text-primary mt-4 pt-4 border-t border-outline-variant/30">
                  <span>Total</span>
                  <span className="tabular-nums">
                    $
                    {viewOrder.total.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {conciergeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setConciergeModalOpen(false)}
        >
          <div
            className="bg-surface text-on-surface max-w-md w-full rounded-xl p-8 shadow-2xl border border-secondary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-label-md text-xs text-secondary uppercase tracking-widest">
                  Atención Personalizada
                </span>
                <h3 className="font-headline-md text-headline-md text-primary">
                  Concierge Chocolates SV
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConciergeModalOpen(false)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {conciergeSent ? (
              <div className="py-6 text-center space-y-4">
                <span className="material-symbols-outlined text-4xl text-success">
                  verified
                </span>
                <p className="font-body-md text-primary font-medium">
                  Tu mensaje sobre el pedido #{viewOrder.orderNumber} ha sido
                  recibido.
                </p>
                <p className="text-caption text-on-surface-variant">
                  Nuestro especialista de logística isotérmica te responderá en
                  menos de 15 minutos.
                </p>
                <button
                  type="button"
                  onClick={() => setConciergeModalOpen(false)}
                  className="w-full py-3 bg-primary text-secondary-fixed font-label-md text-xs uppercase tracking-widest rounded cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleConciergeSubmit} className="space-y-4">
                <p className="text-caption text-on-surface-variant">
                  Referencia automática: <strong>Pedido #{viewOrder.orderNumber}</strong>
                </p>
                <textarea
                  rows={4}
                  required
                  value={conciergeMessage}
                  onChange={(e) => setConciergeMessage(e.target.value)}
                  placeholder="Indícanos instrucciones especiales de entrega o consultas de conservación..."
                  className="w-full border border-outline-variant rounded-lg p-3 bg-surface-container-low focus:border-secondary focus:outline-none text-sm"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setConciergeModalOpen(false)}
                    className="px-4 py-2.5 text-caption text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary text-secondary-fixed font-label-md text-xs uppercase tracking-wider rounded hover:bg-primary-container transition-colors cursor-pointer"
                  >
                    Enviar a Concierge
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
