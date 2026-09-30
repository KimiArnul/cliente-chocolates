import React, { useState } from 'react';
import { ViewRoute } from '../types/models';
import { BRAND_ASSETS } from '../data/mockDatabase';
import { SmartImage } from './SmartImage';

interface FooterProps {
  onNavigate: (route: ViewRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  const policyContent: Record<string, { title: string; body: string }> = {
    privacidad: {
      title: 'Política de Privacidad',
      body: 'En Chocolates SV (Artisanal Indulgence) protegemos tus datos personales bajo estrictos estándares de encriptación. Tu información de contacto y envío se utiliza exclusivamente para procesar tus pedidos y personalizar tu experiencia gourmet.',
    },
    terminos: {
      title: 'Términos de Servicio',
      body: 'Cada lote de Chocolates SV es elaborado artesanalmente en cantidades limitadas. Garantizamos la frescura y el temperado perfecto de todas nuestras creaciones al momento de su despacho desde nuestra boutique central.',
    },
    envios: {
      title: 'Envíos y Conservación Térmica',
      body: 'Todos nuestros pedidos viajan en empaques isotérmicos controlados (16°C – 18°C) con entrega express en 24-48 horas para preservar intactas las notas aromáticas y el brillo del cacao fino.',
    },
  };

  return (
    <footer className="w-full mt-section-gap border-t border-secondary/20 bg-primary text-secondary-fixed font-body-md text-body-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-16 md:py-24 max-w-container-max mx-auto">
        <div className="col-span-1 flex flex-col items-start space-y-4">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <SmartImage
              src={BRAND_ASSETS.logoFooter}
              alt="Chocolates SV Logo"
              className="h-10 w-auto object-contain"
              fallbackLabel="Chocolates SV"
            />
          </button>
          <p className="text-surface-variant/80 text-sm mt-2 leading-relaxed">
            Elaborando momentos de lujo a través del arte del chocolate fino, con
            ingredientes seleccionados y pasión artesanal.
          </p>
        </div>

        <div className="col-span-1 flex flex-col space-y-3">
          <h4 className="font-headline-md text-body-lg font-semibold text-secondary-fixed mb-2">
            Enlaces
          </h4>
          <button
            type="button"
            onClick={() => setActivePolicyModal('privacidad')}
            className="text-left text-surface-variant/80 hover:text-secondary-fixed transition-colors cursor-pointer"
          >
            Privacidad
          </button>
          <button
            type="button"
            onClick={() => setActivePolicyModal('terminos')}
            className="text-left text-surface-variant/80 hover:text-secondary-fixed transition-colors cursor-pointer"
          >
            Términos de Servicio
          </button>
          <button
            type="button"
            onClick={() => setActivePolicyModal('envios')}
            className="text-left text-surface-variant/80 hover:text-secondary-fixed transition-colors cursor-pointer"
          >
            Envíos
          </button>
          <button
            type="button"
            onClick={() => onNavigate('faq')}
            className="text-left text-surface-variant/80 hover:text-secondary-fixed transition-colors cursor-pointer"
          >
            Preguntas frecuentes
          </button>
        </div>

        <div className="col-span-1 flex flex-col space-y-3">
          <h4 className="font-headline-md text-body-lg font-semibold text-secondary-fixed mb-2">
            Contacto
          </h4>
          <p className="text-surface-variant/80 text-sm">
            info@artisanalindulgence.com
          </p>
          <p className="text-surface-variant/80 text-sm tabular-nums">
            +1 (555) 123-4567
          </p>
          <button
            type="button"
            onClick={() => onNavigate('order-tracking')}
            className="text-left text-secondary-fixed/90 hover:text-secondary-fixed text-sm underline underline-offset-4 pt-2 cursor-pointer"
          >
            Menú de Rastereo de Pedido
          </button>
        </div>

        <div className="col-span-1 flex flex-col space-y-3">
          <h4 className="font-headline-md text-body-lg font-semibold text-secondary-fixed mb-2">
            Boletín
          </h4>
          <p className="text-surface-variant/80 text-sm mb-2">
            Suscríbete para ofertas exclusivas y cosechas limitadas.
          </p>
          {subscribed ? (
            <div className="p-3 rounded bg-primary-container border border-secondary/40 text-secondary-fixed text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                check_circle
              </span>
              <span>¡Bienvenido al club privado de Chocolates SV!</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex border-b border-surface-variant/50 focus-within:border-secondary-fixed transition-colors"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email"
                className="bg-transparent border-none focus:outline-none text-secondary-fixed placeholder:text-surface-variant/50 w-full px-0 py-2 text-sm"
              />
              <button
                type="submit"
                aria-label="Suscribirse al boletín"
                className="text-secondary-fixed hover:text-secondary transition-all p-2 cursor-pointer"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
          )}
        </div>

        <div className="col-span-1 md:col-span-4 mt-10 pt-6 border-t border-surface-variant/20 text-center text-surface-variant/60 text-sm">
          © 2024 Artisanal Indulgence — Chocolates SV. El arte del chocolate
          premium.
        </div>
      </div>

      {activePolicyModal && policyContent[activePolicyModal] && (
        <div
          className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePolicyModal(null)}
        >
          <div
            className="bg-surface text-on-surface max-w-md w-full rounded-lg p-8 shadow-2xl border border-secondary/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-headline-md text-headline-md text-primary">
                {policyContent[activePolicyModal].title}
              </h3>
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-md text-on-surface-variant leading-relaxed mb-6">
              {policyContent[activePolicyModal].body}
            </p>
            <button
              type="button"
              onClick={() => setActivePolicyModal(null)}
              className="w-full py-3 bg-primary text-secondary-fixed font-label-md uppercase tracking-wider rounded hover:bg-primary-container transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
