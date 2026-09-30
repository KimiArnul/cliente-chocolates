import React, { useEffect, useState } from 'react';
import { AboutContentDto, ViewRoute } from '../types/models';
import { BRAND_ASSETS } from '../data/mockDatabase';
import { ChocolatesSvApi } from '../services/dotnetApi';
import { SmartImage } from '../components/SmartImage';

interface StoryViewProps {
  onNavigate: (route: ViewRoute) => void;
}

export const StoryView: React.FC<StoryViewProps> = ({ onNavigate }) => {
  const [about, setAbout] = useState<AboutContentDto | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  // Consume Programador 4 APIs:
  // GET /api/content/about
  useEffect(() => {
    ChocolatesSvApi.getAboutContent()
      .then(setAbout)
      .catch((error) => setContentError(error.message));
  }, []);

  if (!about) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
        <h1 className="font-display-lg text-primary mb-4">Información institucional</h1>
        <p className="text-on-surface-variant">{contentError || 'Cargando información...'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24 space-y-20">
      {/* Hero Story (GET /api/content/about) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-6">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em] mb-4 block">
            {about.subtitle || 'Herencia Artesanal'}
          </span>
          <h1
            className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6"
            style={{ textWrap: 'balance' }}
          >
            {about.title}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 leading-relaxed">
            {about.story}
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">
            {about.craftsmanship}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="bg-primary text-secondary-fixed px-8 py-4 rounded font-label-md text-xs uppercase tracking-widest hover:bg-primary-container transition-colors cursor-pointer"
          >
            Explorar Colección
          </button>
        </div>
        <div className="md:col-span-6">
          <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-[0_20px_60px_rgba(62,39,35,0.14)]">
            <SmartImage
              src={BRAND_ASSETS.storyCacaoPod}
              alt="Cosecha artesanal de cacao fino"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Pillars of Craftsmanship */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-outline-variant/40">
        {about.originPillars.map((pillar) => (
          <div
            key={pillar.step}
            className="bg-surface-container-low p-8 rounded-lg border border-secondary/10"
          >
            <span className="font-label-md text-xs text-secondary uppercase tracking-wider block mb-2">
              {pillar.step}
            </span>
            <h3 className="font-headline-md text-xl text-primary mb-3">
              {pillar.title}
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export const ContactView: React.FC = () => {
  const [about, setAbout] = useState<AboutContentDto | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Catas Privadas & Regalos Corporativos',
    message: '',
  });

  useEffect(() => {
    ChocolatesSvApi.getAboutContent().then(setAbout).catch(() => setAbout(null));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-6">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em] block">
            Boutique & Concierge
          </span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
            Contacto
          </h1>
          <p className="font-body-lg text-on-surface-variant leading-relaxed">
            Nuestro equipo de sommeliers de cacao y atención a clientes está a
            tu disposición para pedidos personalizados, eventos privados y
            consultas de envío.
          </p>

          <div className="space-y-4 pt-4 border-t border-outline-variant/40">
            <div>
              <h4 className="font-label-md text-xs uppercase tracking-wider text-secondary">
                Atelier Principal
              </h4>
              <p className="font-body-md text-primary">
                {about?.originPillars.find((pillar) => pillar.step === 'Dirección')?.description || 'Información no disponible'}
              </p>
            </div>
            <div>
              <h4 className="font-label-md text-xs uppercase tracking-wider text-secondary">
                Correo Electrónico
              </h4>
              <p className="font-body-md text-primary">
                {about?.originPillars.find((pillar) => pillar.step === 'Correo')?.description || 'Información no disponible'}
              </p>
            </div>
            <div>
              <h4 className="font-label-md text-xs uppercase tracking-wider text-secondary">
                Teléfono Directo
              </h4>
              <p className="font-body-md text-primary tabular-nums">
                {about?.originPillars.find((pillar) => pillar.step === 'Teléfono')?.description || 'Información no disponible'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-10 rounded-xl ambient-shadow border border-secondary/15">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-success">
                check_circle
              </span>
              <h3 className="font-headline-md text-2xl text-primary">
                Mensaje Enviado con Éxito
              </h3>
              <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
                Gracias por escribirnos, {formData.name}. Nuestro Concierge de
                Chocolates SV se pondrá en contacto contigo a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    subject: 'Catas Privadas & Regalos Corporativos',
                    message: '',
                  });
                }}
                className="px-6 py-3 bg-primary text-secondary-fixed font-label-md text-xs uppercase tracking-widest rounded cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="font-headline-md text-2xl text-primary mb-2">
                Escríbenos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-caption text-caption text-on-surface-variant mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Tu nombre"
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-secondary focus:outline-none px-3 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-caption text-caption text-on-surface-variant mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-secondary focus:outline-none px-3 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-caption text-caption text-on-surface-variant mb-1">
                  Motivo de Consulta
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-secondary focus:outline-none px-3 py-3 text-sm"
                >
                  <option>Catas Privadas & Regalos Corporativos</option>
                  <option>Consulta sobre Pedido en Curso</option>
                  <option>Distribución Boutique</option>
                  <option>Alérgenos e Ingredientes</option>
                </select>
              </div>

              <div>
                <label className="block font-caption text-caption text-on-surface-variant mb-1">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="¿En qué podemos asistirte hoy?"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded focus:border-secondary focus:outline-none p-3 text-sm"
                />
              </div>

              <button
                type="submit"
                className="bg-primary text-secondary-fixed hover:bg-primary-container px-8 py-4 rounded font-label-md text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                Enviar Mensaje
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
