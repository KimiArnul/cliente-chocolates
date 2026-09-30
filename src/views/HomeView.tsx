import React, { useEffect, useState } from 'react';
import { ProductDto, PromotionDto, ViewRoute } from '../types/models';
import { BRAND_ASSETS } from '../data/mockDatabase';
import { ChocolatesSvApi } from '../services/dotnetApi';
import { SmartImage } from '../components/SmartImage';

interface HomeViewProps {
  products: ProductDto[];
  onNavigate: (route: ViewRoute) => void;
  onSelectProduct: (productId: number) => void;
  onAddToCart: (product: ProductDto, quantity?: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductDto[]>([]);
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [carouselOffset, setCarouselOffset] = useState(0);

  // Consume Programador 1 API: GET /api/products/featured
  // and Programador 2 API: GET /api/promotions/active
  useEffect(() => {
    ChocolatesSvApi.getFeaturedProducts().then((feat) => {
      if (feat && feat.length > 0) {
        setFeaturedProducts(feat);
      } else {
        setFeaturedProducts(products.slice(0, 5));
      }
    });

    ChocolatesSvApi.getActivePromotions().then(setPromotions).catch((error) => setPromotionError(error.message));
  }, [products]);

  const featuredList =
    featuredProducts.length > 0 ? featuredProducts : products;

  const visibleProducts = [
    featuredList[carouselOffset % featuredList.length],
    featuredList[(carouselOffset + 1) % featuredList.length],
    featuredList[(carouselOffset + 2) % featuredList.length],
  ].filter(Boolean);

  const handlePrev = () => {
    setCarouselOffset(
      (prev) => (prev - 1 + featuredList.length) % featuredList.length
    );
  };

  const handleNext = () => {
    setCarouselOffset((prev) => (prev + 1) % featuredList.length);
  };

  const activePromo = promotions[0];

  return (
    <div>
      {/* Active Promotion Bar from GET /api/promotions/active (Programador 2 API) */}
      {activePromo && (
        <div className="bg-primary text-secondary-fixed text-xs py-2 px-4 text-center border-b border-secondary/20 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm text-secondary-fixed">
            local_offer
          </span>
          <span>
            {activePromo.descripcion || activePromo.nombre}{' '}
            {activePromo.cupon && (
              <strong className="underline ml-1">Código: {activePromo.cupon}</strong>
            )}
      {promotionError && (
        <p className="py-2 text-center text-xs text-error">No se pudieron cargar las promociones.</p>
      )}
          </span>
        </div>
      )}

      {/* Hero Section (Matches Image 3: Chocolates SV | Inicio) */}
      <section className="relative w-full h-[680px] md:h-[780px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center w-full h-full scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('${BRAND_ASSETS.heroBanner}')` }}
          role="img"
          aria-label="Piezas de chocolate negro artesanal sobre mármol oscuro con acentos de pan de oro"
        />
        <div className="absolute inset-0 bg-primary/45 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />

        <div className="relative z-10 text-center px-margin-mobile flex flex-col items-center max-w-4xl mx-auto">
          <h1
            className="font-display-lg text-display-lg-mobile md:text-display-lg text-surface-container-lowest mb-6 drop-shadow-xl"
            style={{ textWrap: 'balance' }}
          >
            El Arte de la Indulgencia
          </h1>
          <p className="font-body-lg text-body-lg text-surface-container-lowest/90 mb-10 max-w-xl mx-auto drop-shadow-md leading-relaxed">
            Cacao fino de origen único temperado a mano por maestros
            chocolateros. Descubre texturas sedosas, notas aromáticas profundas
            y el placer pausado de la alta confitería artesanal.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="bg-secondary text-on-secondary px-8 py-4 rounded font-label-md text-label-md uppercase tracking-wider hover:bg-secondary/90 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_8px_30px_rgba(115,92,0,0.35)] border border-secondary-fixed/50 cursor-pointer"
          >
            Ver Catálogo
          </button>
        </div>
      </section>

      {/* Featured Collection Carousel Section (GET /api/products/featured) */}
      <section className="py-20 md:py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-surface">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
              Colección Destacada
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Creaciones emblemáticas seleccionadas por nuestros maestros
              chocolateros.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Producto anterior"
              className="p-3 rounded-full border border-outline-variant text-primary hover:bg-surface-variant transition-colors group cursor-pointer"
            >
              <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">
                arrow_left_alt
              </span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente producto"
              className="p-3 rounded-full border border-outline-variant text-primary hover:bg-surface-variant transition-colors group cursor-pointer"
            >
              <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform">
                arrow_right_alt
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visibleProducts.map((product) => (
            <div key={product.id} className="group">
              <div
                onClick={() => onSelectProduct(product.id)}
                className="relative aspect-[4/5] mb-6 overflow-hidden bg-surface-container-low shadow-[0_10px_40px_rgba(62,39,35,0.04)] transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(62,39,35,0.1)] group-hover:-translate-y-1.5 cursor-pointer rounded"
              >
                <SmartImage
                  src={product.mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-surface/90 backdrop-blur-sm text-primary font-label-md text-caption px-3 py-1 rounded uppercase tracking-wider border border-secondary/20">
                    {product.badge || `${product.cacaoPercentage}% Cacao`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div
                  onClick={() => onSelectProduct(product.id)}
                  className="cursor-pointer"
                >
                  <h3 className="font-headline-md text-body-lg text-primary mb-1 group-hover:text-secondary transition-colors">
                    {product.name}
                  </h3>
                  <p className="font-body-md text-caption text-on-surface-variant mb-2">
                    {product.subtitle}
                  </p>
                  <p className="font-label-md text-body-md text-primary font-semibold tabular-nums">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onAddToCart(product, 1)}
                  aria-label={`Añadir ${product.name} al carrito`}
                  className="p-2.5 rounded-full text-secondary hover:bg-secondary/15 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">
                    add_shopping_cart
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story Section (Matches Image 3 bottom section) */}
      <section className="bg-surface-container-low py-20 md:py-section-gap relative overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 relative z-10">
              <div className="relative aspect-square shadow-[0_20px_60px_rgba(62,39,35,0.12)] before:content-[''] before:absolute before:-inset-4 before:border-r before:border-b before:border-secondary/25 before:-z-10">
                <SmartImage
                  src={BRAND_ASSETS.storyCacaoPod}
                  alt="Manos de agricultor sosteniendo una mazorca de cacao recién cosechada"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
            </div>

            <div className="md:col-span-6 md:col-start-7">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em] mb-4 block">
                Nuestra Historia
              </span>
              <h2
                className="font-display-lg text-headline-lg md:text-[48px] leading-tight text-primary mb-6"
                style={{ textWrap: 'balance' }}
              >
                El viaje desde la semilla hasta el alma.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 opacity-90 leading-relaxed">
                Trabajamos directamente con pequeños productores de cacao criollo
                y trinitario en fincas biodinámicas de Centroamérica, Madagascar
                y Sudamérica. Cada cosecha es fermentada en cajas de madera
                noble y secada al sol tropical.
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant mb-10 opacity-80 leading-relaxed">
                En nuestro obrador, tostamos cada lote a baja temperatura y
                conchamos durante 72 horas para lograr una untuosidad sedosa sin
                necesidad de aditivos artificiales.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('story')}
                className="inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:text-secondary transition-colors border-b border-primary hover:border-secondary pb-1 cursor-pointer"
              >
                Descubre el proceso
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
