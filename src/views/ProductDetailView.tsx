import React, { useEffect, useState } from 'react';
import { ProductDto, ViewRoute } from '../types/models';
import { ChocolatesSvApi } from '../services/dotnetApi';
import { SmartImage } from '../components/SmartImage';

interface ProductDetailViewProps {
  product: ProductDto;
  onNavigate: (route: ViewRoute) => void;
  onSelectProduct: (productId: number) => void;
  onAddToCart: (product: ProductDto, quantity: number) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}) => {
  const [activeProduct, setActiveProduct] = useState<ProductDto>(product);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<ProductDto[]>([]);
  const [favorites, setFavorites] = useState<Record<number | string, boolean>>({});

  useEffect(() => {
    setActiveProduct(product);
    setSelectedImageIndex(0);
    setQuantity(1);

    // Consulta el producto fresco de la base de datos vía API .NET 10
    ChocolatesSvApi.getProductById(product.id).then((fresh) => {
      if (fresh) {
        setActiveProduct(fresh);
      }
    });

    ChocolatesSvApi.getRelatedProducts(product.id).then(setRelatedProducts);
  }, [product.id, product]);

  const gallery =
    activeProduct.galleryImages && activeProduct.galleryImages.length > 0
      ? activeProduct.galleryImages
      : [activeProduct.mainImage];

  const activeImage = gallery[selectedImageIndex] || activeProduct.mainImage;

  const toggleFavorite = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-5 flex flex-col gap-base">
          <div className="w-full aspect-[4/5] bg-surface-container-high rounded-lg overflow-hidden shadow-[0_4px_20px_rgba(62,39,35,0.08)]">
            <SmartImage
              src={activeImage}
              alt={`${activeProduct.name} - Vista principal`}
              fallbackLabel={activeProduct.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-base mt-1">
              {gallery.map((imgUrl, idx) => {
                const isSelected = idx === selectedImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Ver miniatura ${idx + 1}`}
                    className={`aspect-square bg-surface-container rounded cursor-pointer overflow-hidden transition-all ${
                      isSelected
                        ? 'border-2 border-secondary p-0.5 opacity-100'
                        : 'border border-primary/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <SmartImage
                      src={imgUrl}
                      alt={`${activeProduct.name} miniatura ${idx + 1}`}
                      fallbackLabel={activeProduct.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="md:col-span-7 flex flex-col px-0 md:pl-12 pt-6 md:pt-0">
          <nav className="flex items-center text-on-surface-variant text-caption font-caption mb-6">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Catálogo
            </button>
            <span className="mx-2">/</span>
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              {activeProduct.badge || activeProduct.category}
            </button>
            <span className="mx-2">/</span>
            <span className="text-primary font-medium">{activeProduct.name}</span>
          </nav>

          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
            {activeProduct.name}
          </h1>

          <div className="flex items-center space-x-4 mb-6">
            <span className="font-headline-lg text-headline-lg text-primary tabular-nums">
              ${activeProduct.price.toFixed(2)}
            </span>
            <div className="flex items-center text-secondary-fixed-dim">
              {[1, 2, 3, 4].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-sm fill"
                >
                  star
                </span>
              ))}
              <span className="material-symbols-outlined text-sm fill">
                {activeProduct.rating >= 4.8 ? 'star' : 'star_half'}
              </span>
              <span className="text-on-surface-variant text-caption font-caption ml-2 tabular-nums">
                ({activeProduct.reviewsCount} reseñas)
              </span>
            </div>
          </div>

          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
            {activeProduct.fullDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center mb-10">
            <div className="flex items-center border border-outline-variant rounded bg-surface h-[56px] px-2 w-full sm:w-auto shadow-sm justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Disminuir cantidad"
                className="p-2 text-primary hover:text-secondary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <input
                aria-label="Cantidad"
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="w-16 text-center border-none bg-transparent font-headline-md text-headline-md text-primary focus:outline-none p-0 tabular-nums"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar cantidad"
                className="p-2 text-primary hover:text-secondary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onAddToCart(activeProduct, quantity)}
              className="flex-grow w-full bg-[#D4AF37] hover:bg-secondary hover:text-on-secondary text-primary font-headline-md text-headline-md py-3.5 px-8 rounded flex justify-center items-center gap-2 border border-secondary shadow-[0_4px_20px_rgba(62,39,35,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              Añadir al Carrito
            </button>
          </div>

          <div className="border-t border-outline-variant pt-4">
            <details className="group mb-4" open>
              <summary className="flex justify-between items-center cursor-pointer font-headline-md text-body-lg text-primary list-none pb-2">
                <span>Ingredientes</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </summary>
              <ul className="font-body-md text-body-md text-on-surface-variant pt-2 pb-4 space-y-3 list-none">
                {activeProduct.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                    <span>{ing}</span>
                  </li>
                ))}
                <li className="mt-4 italic text-sm opacity-80">
                  {activeProduct.allergenNote}
                </li>
              </ul>
            </details>

            <details className="group border-t border-outline-variant pt-4 mb-4">
              <summary className="flex justify-between items-center cursor-pointer font-headline-md text-body-lg text-primary list-none pb-2">
                <span>Envíos y Conservación</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </summary>
              <p className="font-body-md text-body-md text-on-surface-variant pt-2 pb-4 leading-relaxed">
                {activeProduct.shippingAndCare}
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-20 md:py-section-gap">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-12">
            <h2 className="font-display-lg text-headline-lg text-primary mb-4">
              Productos Relacionados
            </h2>
            <div className="w-16 h-0.5 bg-secondary mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter">
            {relatedProducts.map((rel) => {
              const isFav = Boolean(favorites[rel.id]);
              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct(rel.id)}
                  className="bg-surface rounded-lg shadow-[0_4px_20px_rgba(62,39,35,0.04)] hover:-translate-y-2 transition-transform duration-300 overflow-hidden flex flex-col group cursor-pointer border border-primary/5"
                >
                  <div className="aspect-[4/5] bg-surface-container relative overflow-hidden">
                    <SmartImage
                      src={rel.mainImage}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(e, rel.id)}
                      aria-label={`Guardar ${rel.name} en favoritos`}
                      className={`absolute top-4 right-4 bg-surface/90 rounded-full p-2 text-primary transition-opacity cursor-pointer ${
                        isFav
                          ? 'opacity-100 text-secondary'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-xl ${
                          isFav ? 'fill' : ''
                        }`}
                      >
                        {isFav ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>
                  </div>
                  <div className="p-6 flex flex-col items-center text-center">
                    <h4 className="font-headline-md text-body-lg text-primary mb-2 group-hover:text-secondary transition-colors">
                      {rel.name}
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                      {rel.subtitle}
                    </p>
                    <span className="font-headline-md text-body-lg text-primary font-semibold tabular-nums">
                      ${rel.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
