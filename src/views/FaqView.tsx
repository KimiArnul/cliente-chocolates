import React, { useEffect, useState } from 'react';
import { FaqItemDto } from '../types/models';
import { ChocolatesSvApi } from '../services/dotnetApi';

export const FaqView: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItemDto[]>([]);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    ChocolatesSvApi.getFaqList()
      .then(setFaqs)
      .catch((error) => setContentError(error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24">
      <section className="pt-12 border-t border-outline-variant/40">
        <div className="text-center mb-12">
          <span className="font-label-md text-xs text-secondary uppercase tracking-[0.2em] mb-2 block">
            Información al Cliente
          </span>
          <h1 className="font-display-lg text-headline-lg text-primary mb-3">
            Preguntas Frecuentes
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-lg mx-auto">
            Respuestas a las dudas más comunes sobre conservación, envíos
            isotérmicos y pedidos en modalidad invitado.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {loading && (
            <p className="text-center text-body-md text-on-surface-variant">
              Cargando preguntas frecuentes...
            </p>
          )}
          {!loading && contentError && (
            <p className="text-center text-body-md text-on-surface-variant">
              {contentError}
            </p>
          )}
          {faqs.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-surface-container-low rounded-lg border border-outline-variant/30 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left flex justify-between items-center font-headline-md text-base text-primary hover:text-secondary transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <span
                    className={`material-symbols-outlined text-secondary transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm font-body-md text-on-surface-variant leading-relaxed border-t border-outline-variant/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};