import React, { useEffect, useState } from 'react';
import {
  CartItemDto,
  OrderTrackingDto,
  PaymentDetailsDto,
  ShippingAddressDto,
} from '../types/models';
import { ChocolatesSvApi } from '../services/dotnetApi';
import { SmartImage } from '../components/SmartImage';
import { BRAND_ASSETS } from '../data/mockDatabase';

interface CheckoutViewProps {
  items: CartItemDto[];
  onOrderCompleted: (order: OrderTrackingDto) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  items,
  onOrderCompleted,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  const [shipping, setShipping] = useState<ShippingAddressDto>({
    email: '', newsletter: false, firstName: '', lastName: '', address: '',
    apartment: '', postalCode: '', city: '', province: '', phone: '',
  });

  const [payment, setPayment] = useState<PaymentDetailsDto>({
    method: 'credit_card',
    cardNumber: '', cardHolderName: '', expiryDate: '', cvv: '',
  });

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountRate, setDiscountRate] = useState(0);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [paymentSimulationError, setPaymentSimulationError] = useState<string | null>(null);
  const [calculation, setCalculation] = useState<{
    subtotal: number;
    discountAmount: number;
    shippingAmount: number;
    taxAmount: number;
    total: number;
  }>({
    subtotal: 0,
    discountAmount: 0,
    shippingAmount: 0,
    taxAmount: 0,
    total: 0,
  });

  // Calculate cart via POST /api/cart/calculate (API Oficial .NET 10)
  useEffect(() => {
    const rawItems = items.map((i) => ({
      productoId: typeof i.productId === 'number' ? i.productId : parseInt(i.productId as any, 10),
      cantidad: i.quantity,
    }));
    ChocolatesSvApi.calculateCart(rawItems, appliedCoupon || undefined).then(
      (calc) => {
        setCalculation({
          subtotal: calc.subtotal,
          discountAmount: calc.descuento,
          shippingAmount: 0,
          taxAmount: 0,
          total: calc.total,
        });
      }
      ).catch((error) => setPaymentSimulationError(error.message));
  }, [items, appliedCoupon, activeStep]);

  // Validate coupon via POST /api/promotions/validate-coupon (API Oficial .NET 10)
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const result = await ChocolatesSvApi.validateCoupon(
      couponInput,
      calculation.subtotal
    );
    if (result.valido && result.codigo) {
      setAppliedCoupon(result.codigo);
      setDiscountRate(result.valor / 100);
      setCouponFeedback(result.mensaje);
    } else {
      setCouponFeedback(result.mensaje);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveStep(2);
  };

  // Simulate payment via POST /api/checkout/simulate-payment (API Oficial .NET 10)
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSimulationError(null);
    setSubmitting(true);

    try {
      const paymentResult = await ChocolatesSvApi.simulatePayment({
        numeroTarjeta: payment.cardNumber.replace(/\D/g, ''),
        fechaExpiracion: payment.expiryDate,
        cvv: payment.cvv,
        monto: calculation.total,
      });

      if (!paymentResult.aprobado) {
        setPaymentSimulationError(paymentResult.mensaje);
        return;
      }

      setActiveStep(3);
    } catch (error) {
      setPaymentSimulationError(error instanceof Error ? error.message : 'No se pudo simular el pago.');
    } finally {
      setSubmitting(false);
    }
  };

  // Create order via POST /api/orders (API Oficial .NET 10)
  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try {
      const cleanDigits = payment.cardNumber.replace(/\D/g, '');
      const createdOrder = await ChocolatesSvApi.createOrder({
        nombreCliente: `${shipping.firstName} ${shipping.lastName}`.trim(),
        correoCliente: shipping.email,
        telefonoCliente: shipping.phone || null,
        fechaEntrega: new Date(Date.now() + 86400000 * 2).toISOString(),
        comentarios: `${shipping.address}, ${shipping.apartment || ''}, ${shipping.city}, ${shipping.province} ${shipping.postalCode}`.trim(),
        items: items.map((i) => ({
          productoId: typeof i.productId === 'number' ? i.productId : parseInt(i.productId as any, 10),
          cantidad: i.quantity,
        })),
        codigoCupon: appliedCoupon || null,
        pago: {
          numeroTarjeta: cleanDigits,
           fechaExpiracion: payment.expiryDate,
           cvv: payment.cvv,
          monto: calculation.total,
        },
      });

      // Mapear al modelo de seguimiento para la vista de tracking
      const trackingOrder: OrderTrackingDto = {
        orderNumber: createdOrder.numeroOrden,
        placedDate: new Date(createdOrder.fechaCreacion || Date.now()).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        statusLabel: createdOrder.estado || 'Pendiente',
        shippingAddress: {
          recipientName: `${shipping.firstName} ${shipping.lastName}`.trim(),
          line1: shipping.address,
          line2: shipping.apartment,
          cityStateZip: `${shipping.city}, ${shipping.province} ${shipping.postalCode}`,
        },
        steps: [
          {
            id: 'step-1',
            title: 'Pedido Confirmado',
            timestamp: 'Hoy, Hace unos instantes',
            description: `Confirmación enviada a ${shipping.email}. Ref de Pago: ${createdOrder.referenciaPago}`,
            status: 'completed',
            icon: 'check',
          },
          {
            id: 'step-2',
            title: 'En Preparación',
            timestamp: 'En curso',
            description: 'Nuestros artesanos están empaquetando tus chocolates con control térmico.',
            status: 'current',
            icon: 'inventory_2',
          },
          {
            id: 'step-3',
            title: 'En Camino',
            timestamp: 'Despacho prioritario programado',
            description: 'El paquete saldrá con control estricto de temperatura.',
            status: 'pending',
            icon: 'local_shipping',
          },
        ],
        items: items.map((i) => ({
          productId: i.productId,
          name: i.product.name,
          subtitle: i.product.weightOrCount,
          quantity: i.quantity,
          unitPrice: i.product.price,
          lineTotal: Number((i.product.price * i.quantity).toFixed(2)),
          image: i.product.mainImage,
        })),
        subtotal: createdOrder.subtotal,
        shippingCost: 0,
        discountAmount: createdOrder.descuento,
        total: createdOrder.total,
        bannerImage: BRAND_ASSETS.heroBanner,
      };

      onOrderCompleted(trackingOrder);
    } catch (error) {
      setPaymentSimulationError(error instanceof Error ? error.message : 'No se pudo crear el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBaseClass =
    'w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-secondary focus:outline-none px-3 py-3 transition-colors duration-300 font-body-md text-on-surface placeholder:text-on-surface-variant/60';

  const inputGoldClass =
    'w-full border border-secondary/35 rounded-lg px-4 py-3 focus:border-secondary focus:outline-none bg-surface-container-lowest font-body-md text-on-surface placeholder:text-on-surface-variant/50';

  return (
    <div className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-16">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-12">
          <div className="flex items-center justify-between relative mb-4">
            <div className="absolute top-4 left-0 w-full h-[1px] bg-outline-variant -z-10" />

            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="flex flex-col items-center gap-2 bg-background px-3 cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-sm transition-colors ${
                  activeStep >= 1
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant text-on-surface-variant bg-surface'
                }`}
              >
                {activeStep > 1 ? (
                  <span className="material-symbols-outlined text-base">
                    check
                  </span>
                ) : (
                  '1'
                )}
              </div>
              <span
                className={`font-label-md text-xs ${
                  activeStep >= 1 ? 'text-primary font-semibold' : 'text-on-surface-variant'
                }`}
              >
                Envío
              </span>
            </button>

            <button
              type="button"
              onClick={() => activeStep >= 2 && setActiveStep(2)}
              className="flex flex-col items-center gap-2 bg-background px-3 cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-sm transition-colors ${
                  activeStep >= 2
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant text-on-surface-variant bg-surface'
                }`}
              >
                {activeStep > 2 ? (
                  <span className="material-symbols-outlined text-base">
                    check
                  </span>
                ) : (
                  '2'
                )}
              </div>
              <span
                className={`font-label-md text-xs ${
                  activeStep >= 2 ? 'text-primary font-semibold' : 'text-on-surface-variant'
                }`}
              >
                Pago
              </span>
            </button>

            <button
              type="button"
              onClick={() => activeStep >= 3 && setActiveStep(3)}
              className="flex flex-col items-center gap-2 bg-background px-3 cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-sm transition-colors ${
                  activeStep === 3
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant text-on-surface-variant bg-surface'
                }`}
              >
                3
              </div>
              <span
                className={`font-label-md text-xs ${
                  activeStep === 3
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant'
                }`}
              >
                Revisión
              </span>
            </button>
          </div>

          <section
            className={`space-y-8 transition-opacity duration-300 ${
              activeStep !== 1 ? 'opacity-65' : 'opacity-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary mb-1 flex items-center gap-2">
                  <span>1. Información de Envío</span>
                  {activeStep > 1 && (
                    <span className="material-symbols-outlined text-success text-xl">
                      check_circle
                    </span>
                  )}
                </h2>
                <p className="font-body-md text-on-surface-variant text-sm">
                  Ingrese los detalles para la entrega de su pedido.
                </p>
              </div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-caption text-secondary underline cursor-pointer"
                >
                  Editar
                </button>
              )}
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-label-md text-primary uppercase tracking-widest text-xs border-b border-outline-variant pb-2">
                  Contacto
                </h3>
                <div>
                  <input
                    type="email"
                    required
                    value={shipping.email}
                    onChange={(e) =>
                      setShipping({ ...shipping, email: e.target.value })
                    }
                    placeholder="Correo electrónico"
                    className={inputBaseClass}
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shipping.newsletter}
                    onChange={(e) =>
                      setShipping({ ...shipping, newsletter: e.target.checked })
                    }
                    className="rounded border-outline-variant text-primary focus:ring-secondary accent-primary"
                  />
                  <span className="font-caption text-caption text-on-surface-variant">
                    Deseo recibir noticias y ofertas exclusivas.
                  </span>
                </label>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-label-md text-primary uppercase tracking-widest text-xs border-b border-outline-variant pb-2">
                  Dirección de Entrega
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    required
                    value={shipping.firstName}
                    onChange={(e) =>
                      setShipping({ ...shipping, firstName: e.target.value })
                    }
                    placeholder="Nombre"
                    className={inputBaseClass}
                  />
                  <input
                    type="text"
                    required
                    value={shipping.lastName}
                    onChange={(e) =>
                      setShipping({ ...shipping, lastName: e.target.value })
                    }
                    placeholder="Apellidos"
                    className={inputBaseClass}
                  />
                </div>

                <input
                  type="text"
                  required
                  value={shipping.address}
                  onChange={(e) =>
                    setShipping({ ...shipping, address: e.target.value })
                  }
                  placeholder="Dirección (Calle, número)"
                  className={inputBaseClass}
                />

                <input
                  type="text"
                  value={shipping.apartment}
                  onChange={(e) =>
                    setShipping({ ...shipping, apartment: e.target.value })
                  }
                  placeholder="Apartamento, suite, etc. (opcional)"
                  className={inputBaseClass}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input
                    type="text"
                    required
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping({ ...shipping, postalCode: e.target.value })
                    }
                    placeholder="Código Postal"
                    className={inputBaseClass}
                  />
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                    placeholder="Ciudad"
                    className={inputBaseClass}
                  />
                  <div className="relative">
                    <select
                      value={shipping.province}
                      onChange={(e) =>
                        setShipping({ ...shipping, province: e.target.value })
                      }
                      className={`${inputBaseClass} appearance-none pr-8`}
                    >
                      <option value="CDMX">CDMX / Ciudad de México</option>
                      <option value="Madrid">Madrid</option>
                      <option value="Barcelona">Barcelona</option>
                      <option value="San Salvador">San Salvador</option>
                      <option value="Valencia">Valencia</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-3 text-on-surface-variant pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                <input
                  type="tel"
                  required
                  value={shipping.phone}
                  onChange={(e) =>
                    setShipping({ ...shipping, phone: e.target.value })
                  }
                  placeholder="Teléfono"
                  className={inputBaseClass}
                />
              </div>

              {activeStep === 1 && (
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary text-secondary-fixed hover:bg-primary-container px-8 py-4 rounded font-label-md text-xs tracking-wider uppercase transition-all duration-300 shadow-[0_4px_15px_rgba(39,19,16,0.15)] cursor-pointer"
                  >
                    Continuar al Pago
                  </button>
                </div>
              )}
            </form>
          </section>

          <section
            className={`space-y-8 transition-opacity duration-300 ${
              activeStep < 2
                ? 'opacity-45 pointer-events-none'
                : 'opacity-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary mb-1 flex items-center gap-2">
                  <span>2. Método de Pago</span>
                  {activeStep > 2 && (
                    <span className="material-symbols-outlined text-success text-xl">
                      check_circle
                    </span>
                  )}
                </h2>
                <p className="font-body-md text-on-surface-variant text-sm">
                  Todas las transacciones son seguras y están encriptadas.
                </p>
              </div>
              <span className="material-symbols-outlined text-2xl text-outline-variant">
                lock
              </span>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="bg-surface-container-lowest border border-secondary/25 rounded-xl p-6 shadow-[0_8px_30px_rgba(115,92,0,0.04)]">
                <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="credit-card"
                      name="payment"
                      checked
                      readOnly
                      className="text-primary focus:ring-secondary accent-primary"
                    />
                    <label
                      htmlFor="credit-card"
                      className="font-label-md text-primary"
                    >
                      Tarjeta de Crédito / Débito
                    </label>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant fill">
                    credit_card
                  </span>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block font-caption text-caption text-on-surface-variant mb-1">
                      Número de Tarjeta
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={payment.cardNumber}
                        onChange={(e) =>
                          setPayment({ ...payment, cardNumber: e.target.value })
                        }
                        placeholder="0000 0000 0000 0000"
                        className={`${inputGoldClass} pl-10 tabular-nums`}
                      />
                      <span className="material-symbols-outlined absolute left-3 top-3.5 text-secondary/70">
                        credit_score
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-caption text-caption text-on-surface-variant mb-1">
                      Nombre en la Tarjeta
                    </label>
                    <input
                      type="text"
                      required
                      value={payment.cardHolderName}
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          cardHolderName: e.target.value,
                        })
                      }
                      placeholder="Nombre como aparece en la tarjeta"
                      className={inputGoldClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block font-caption text-caption text-on-surface-variant mb-1">
                        Fecha de Expiración (MM/AA)
                      </label>
                      <input
                        type="text"
                        required
                        value={payment.expiryDate}
                        onChange={(e) =>
                          setPayment({ ...payment, expiryDate: e.target.value })
                        }
                        placeholder="MM / AA"
                        className={`${inputGoldClass} tabular-nums`}
                      />
                    </div>
                    <div>
                      <label className="block font-caption text-caption text-on-surface-variant mb-1 flex items-center justify-between">
                        <span>Código de Seguridad (CVV)</span>
                        <span
                          className="material-symbols-outlined text-[16px]"
                          title="3 o 4 dígitos en el reverso de la tarjeta"
                        >
                          help
                        </span>
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={payment.cvv}
                        onChange={(e) =>
                          setPayment({ ...payment, cvv: e.target.value })
                        }
                        placeholder="•••"
                        className={`${inputGoldClass} tabular-nums`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {paymentSimulationError && (
                <div className="p-3.5 rounded bg-error-container/40 border border-error/30 text-error text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  <span>{paymentSimulationError}</span>
                </div>
              )}

              {activeStep === 2 && (
                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="text-on-surface-variant hover:text-primary font-label-md text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_left
                    </span>
                    Volver al Envío
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary text-secondary-fixed hover:bg-primary-container px-8 py-4 rounded font-label-md text-xs tracking-wider uppercase transition-all duration-300 shadow-[0_4px_15px_rgba(39,19,16,0.15)] cursor-pointer"
                  >
                    {submitting ? 'Validando Tarjeta...' : 'Revisar Pedido'}
                  </button>
                </div>
              )}
            </form>
          </section>

          {activeStep === 3 && (
            <section className="bg-surface-container-lowest border border-secondary/30 rounded-xl p-8 shadow-[0_8px_30px_rgba(62,39,35,0.08)] space-y-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary mb-1">
                  3. Revisión del Pedido
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant">
                  Verifica los datos antes de autorizar el envío isotérmico.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface-container-low p-5 rounded-lg">
                <div>
                  <h4 className="font-label-md text-xs uppercase tracking-wider text-secondary mb-2">
                    Destinatario y Dirección
                  </h4>
                  <p className="font-body-md text-sm text-primary font-medium">
                    {shipping.firstName} {shipping.lastName}
                  </p>
                  <p className="text-caption text-on-surface-variant">
                    {shipping.address}
                    {shipping.apartment ? `, ${shipping.apartment}` : ''}
                  </p>
                  <p className="text-caption text-on-surface-variant">
                    {shipping.city}, {shipping.province} {shipping.postalCode}
                  </p>
                </div>
                <div>
                  <h4 className="font-label-md text-xs uppercase tracking-wider text-secondary mb-2">
                    Método de Pago
                  </h4>
                  <p className="font-body-md text-sm text-primary font-medium">
                    Tarjeta terminada en{' '}
                    {payment.cardNumber.replace(/\D/g, '').slice(-4) || '8891'}
                  </p>
                  <p className="text-caption text-on-surface-variant">
                    Titular: {payment.cardHolderName}
                  </p>
                  <p className="text-caption text-success font-medium mt-1">
                    Empaque isotérmico incluido
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="text-on-surface-variant hover:text-primary font-label-md text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_left
                  </span>
                  Modificar Pago
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmOrder}
                  className="bg-[#D4AF37] hover:bg-secondary hover:text-on-secondary text-primary font-label-md text-xs tracking-widest uppercase px-8 py-4 rounded shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    verified_user
                  </span>
                  {submitting
                    ? 'Procesando Pedido...'
                    : `Confirmar y Pagar $${calculation.total.toFixed(2)}`}
                </button>
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-surface-container-low rounded-xl p-6 lg:p-8 sticky top-[110px] shadow-[0_8px_30px_rgba(62,39,35,0.06)]">
            <h2 className="font-headline-md text-headline-md text-primary mb-6 border-b border-outline-variant/50 pb-4">
              Resumen del Pedido
            </h2>

            <div className="space-y-6 mb-8">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="w-20 h-20 bg-surface-container-high rounded shrink-0 relative">
                    <SmartImage
                      src={item.product.mainImage}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute -top-2 -right-2 bg-secondary text-on-secondary w-6 h-6 rounded-full flex items-center justify-center font-caption font-bold text-[10px] tabular-nums shadow">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <h4 className="font-label-md text-on-surface">
                        {item.product.name}
                      </h4>
                      <p className="font-caption text-caption text-on-surface-variant">
                        {item.product.subtitle}
                      </p>
                    </div>
                    <p className="font-label-md text-primary mt-1 tabular-nums">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Código de descuento (ej. SV10)"
                  className="w-full border border-outline-variant/60 px-4 py-2.5 bg-surface rounded-l text-sm focus:border-secondary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-surface-container-high text-primary px-4 py-2.5 font-label-md text-xs rounded-r hover:bg-outline-variant/40 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Aplicar
                </button>
              </div>
              {couponFeedback && (
                <p
                  className={`text-caption mt-2 ${
                    discountRate > 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  {couponFeedback}
                </p>
              )}
            </div>

            <div className="space-y-3 font-body-md text-sm text-on-surface-variant border-b border-outline-variant/50 pb-6 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-on-surface tabular-nums">
                  ${calculation.subtotal.toFixed(2)}
                </span>
              </div>
              {calculation.discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Descuento {appliedCoupon ? `(${appliedCoupon})` : ''}</span>
                  <span className="tabular-nums">
                    -${calculation.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-on-surface tabular-nums">
                  {activeStep === 1
                    ? 'Calculado en el siguiente paso'
                    : `$${calculation.shippingAmount.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos</span>
                <span className="text-on-surface tabular-nums">
                  ${calculation.taxAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <span className="font-body-lg text-on-surface">Total</span>
              <div className="text-right">
                <span className="font-caption text-caption text-on-surface-variant mr-2">
                  USD
                </span>
                <span className="font-headline-lg text-headline-lg text-primary tabular-nums">
                  ${calculation.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
