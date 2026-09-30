import React, { useEffect, useState } from 'react';
import { ProductDto, CategoriaDto } from '../types/models';
import { ChocolatesSvApi } from '../services/dotnetApi';
import { SmartImage } from '../components/SmartImage';

interface CatalogViewProps {
  products?: ProductDto[];
  categories: CategoriaDto[];
  searchQuery: string;
  onSelectProduct: (productId: number) => void;
  onAddToCart: (product: ProductDto, quantity?: number) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  searchQuery,
  onSelectProduct,
  onAddToCart,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minCacao, setMinCacao] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(150);
  const [sortBy, setSortBy] = useState<'relevancia' | 'price-asc' | 'price-desc' | 'novedades'>('relevancia');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Estado de carga y resultados del catálogo
  const [apiProducts, setApiProducts] = useState<ProductDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const itemsPerPage = 6;

  // Consulta directa a la API de .NET 10 / Base de datos al modificar filtros
  const fetchProductsFromDatabase = async () => {
    setLoading(true);
    try {
      // Si hay exactamente una categoría seleccionada, la enviamos al backend
      const result = await ChocolatesSvApi.getProductsPaged({
        minCacao: minCacao !== null ? minCacao : undefined,
        maxPrice: maxPrice < 150 ? maxPrice : undefined,
        search: searchQuery.trim() || undefined,
        sort: sortBy,
        page: currentPage,
        pageSize: itemsPerPage,
      });

      // Si el cliente seleccionó más de 1 categoría, aplicamos el filtro compuesto
      let displayProducts = result.products.map((product) => ({
        ...product,
        category: categories.find((category) => category.id === product.idCategoria)?.nombre || product.category,
      }));
      let totalResults = result.total;

      if (selectedCategories.length > 0) {
        displayProducts = displayProducts.filter((p) =>
          selectedCategories.includes(p.category)
        );
        totalResults = displayProducts.length;
      }

      setApiProducts(displayProducts);
      setTotalCount(totalResults);
      setTotalPages(
        selectedCategories.length > 1
          ? Math.max(1, Math.ceil(displayProducts.length / itemsPerPage))
          : result.totalPages
      );
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsFromDatabase();
  }, [
    selectedCategories,
    minCacao,
    maxPrice,
    searchQuery,
    sortBy,
    currentPage,
    categories,
  ]);

  const toggleCategory = (category: string) => {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCacaoFilter = (value: number) => {
    setCurrentPage(1);
    setMinCacao((prev) => (prev === value ? null : value));
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setMinCacao(null);
    setMaxPrice(150);
    setSortBy('relevancia');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Barra lateral de filtros */}
      <aside className="lg:col-span-3 space-y-gutter">
        <div className="lg:sticky lg:top-[100px] bg-surface p-4 lg:p-0 rounded-lg border border-outline-variant/30 lg:border-none">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-md text-headline-md text-primary">
              Filtros
            </h2>
            {(selectedCategories.length > 0 ||
              minCacao !== null ||
              maxPrice < 150) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-caption text-secondary hover:underline cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="mb-8 border-b border-surface-variant pb-6">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4">
              Colección
            </h3>
            <div className="space-y-3">
              {categories.map((category) => {
                const checked = selectedCategories.includes(category.nombre);
                return (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                    onChange={() => toggleCategory(category.nombre)}
                      className="w-4 h-4 accent-primary rounded-sm border-outline-variant cursor-pointer"
                    />
                    <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">
                    {category.nombre}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mb-8 border-b border-surface-variant pb-6">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4">
              % Cacao
            </h3>
            <div className="flex flex-wrap gap-2">
              {[50, 70, 85].map((pct) => {
                const active = minCacao === pct;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleCacaoFilter(pct)}
                    className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'border border-secondary bg-secondary/20 text-primary font-semibold'
                        : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    {pct}%+
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Rango de Precio
              </h3>
              <span className="font-caption text-caption text-primary font-semibold tabular-nums">
                Hasta ${maxPrice.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={150}
              step={0.5}
              value={maxPrice}
              onChange={(e) => {
                setCurrentPage(1);
                setMaxPrice(Number(e.target.value));
              }}
              aria-label="Rango de precio máximo"
              className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-2 font-caption text-caption text-on-surface-variant tabular-nums">
              <span>$0.50</span>
              <span>$150+</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Catálogo de productos */}
      <section className="lg:col-span-9">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-surface-variant pb-4">
          <div className="flex items-center gap-2">
            <span className="font-body-md text-on-surface-variant tabular-nums">
              Mostrando {apiProducts.length} de {totalCount} productos
            </span>
            {loading && (
              <span className="text-secondary text-xs flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Cargando productos...
              </span>
            )}
            <button
              type="button"
              onClick={fetchProductsFromDatabase}
              title="Actualizar catálogo"
              aria-label="Actualizar catálogo"
              disabled={loading}
              className="text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>Actualizar</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="catalog-sort"
              className="text-caption text-on-surface-variant"
            >
              Ordenar por:
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => {
                setCurrentPage(1);
                setSortBy(
                  e.target.value as
                    | 'relevancia'
                    | 'price-asc'
                    | 'price-desc'
                    | 'novedades'
                );
              }}
              className="bg-transparent border-none text-primary font-label-md text-label-md focus:outline-none cursor-pointer pr-2"
            >
              <option value="relevancia">Relevancia</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="novedades">Novedades</option>
            </select>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && apiProducts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-surface-container-low rounded-lg p-6 animate-pulse flex flex-col gap-4 border border-outline-variant/20"
              >
                <div className="aspect-square bg-surface-container rounded-md w-full" />
                <div className="h-5 bg-surface-container rounded w-3/4" />
                <div className="h-4 bg-surface-container rounded w-full" />
                <div className="h-4 bg-surface-container rounded w-1/2 mt-auto" />
              </div>
            ))}
          </div>
        ) : apiProducts.length === 0 ? (
          <div className="bg-surface-container-low rounded-lg p-12 text-center my-8 border border-secondary/15">
            <span className="material-symbols-outlined text-4xl text-outline mb-3">
              inventory_2
            </span>
            <h3 className="font-headline-md text-xl text-primary mb-2">
              No se encontraron productos con estos filtros
            </h3>
            <p className="font-body-md text-on-surface-variant mb-6">
              Intenta ampliar el rango de precio o seleccionar otra colección.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-6 py-3 bg-primary text-secondary-fixed font-label-md text-xs uppercase tracking-widest rounded hover:bg-primary-container transition-colors cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {apiProducts.map((product) => {
              if (product.isHeroBento) {
                return (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-primary-container text-on-primary-container rounded-lg overflow-hidden shadow-[0_4px_20px_rgba(62,39,35,0.08)] hover:shadow-[0_12px_40px_rgba(62,39,35,0.2)] transition-shadow duration-300 xl:col-span-2 sm:col-span-2 sm:flex-row"
                  >
                    <div
                      onClick={() => onSelectProduct(product.id)}
                      className="sm:w-1/2 aspect-square sm:aspect-auto relative overflow-hidden bg-surface-tint cursor-pointer"
                    >
                      <SmartImage
                        src={product.mainImage}
                        alt={product.name}
                        fallbackLabel={product.name}
                        className="object-cover w-full h-full sm:absolute sm:inset-0 group-hover:scale-105 transition-transform duration-700 ease-in-out opacity-95"
                      />
                    </div>
                    <div className="p-8 sm:w-1/2 flex flex-col justify-center">
                      <span className="font-label-md text-label-md text-secondary-fixed uppercase tracking-widest mb-2 opacity-85">
                        {product.badge || 'Edición Limitada'}
                      </span>
                      <h4
                        onClick={() => onSelectProduct(product.id)}
                        className="font-display-lg text-[32px] text-secondary-fixed mb-4 leading-tight cursor-pointer hover:opacity-90"
                      >
                        {product.name}
                      </h4>
                      <p className="font-body-md text-body-md text-on-primary-container mb-8 leading-relaxed">
                        {product.shortDescription}
                      </p>
                      <div className="mt-auto flex justify-between items-center">
                        <span className="font-headline-md text-headline-md text-secondary-fixed tabular-nums">
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAddToCart(product, 1)}
                          className="px-6 py-3 bg-secondary-fixed text-primary-container font-label-md text-label-md rounded-full hover:bg-white transition-colors shadow-md cursor-pointer whitespace-nowrap"
                        >
                          Añadir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_4px_20px_rgba(62,39,35,0.04)] hover:shadow-[0_8px_30px_rgba(62,39,35,0.12)] transition-shadow duration-300 relative"
                >
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-secondary/90 text-on-secondary px-2.5 py-1 rounded-sm font-label-md text-[10px] tracking-wider uppercase backdrop-blur-sm shadow-sm">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  <div
                    onClick={() => onSelectProduct(product.id)}
                    className="aspect-square w-full relative overflow-hidden bg-surface-container-low cursor-pointer"
                  >
                    <SmartImage
                      src={product.mainImage}
                      alt={product.name}
                      fallbackLabel={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h4
                      onClick={() => onSelectProduct(product.id)}
                      className="font-headline-md text-[20px] text-primary mb-1 group-hover:text-secondary transition-colors cursor-pointer"
                    >
                      {product.name}
                    </h4>
                    <p className="font-caption text-caption text-on-surface-variant line-clamp-2 mb-4">
                      {product.shortDescription}
                    </p>
                    <div className="mt-auto flex justify-between items-end">
                      <span className="font-body-lg text-body-lg text-primary font-semibold tabular-nums">
                        ${product.price.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAddToCart(product, 1)}
                        aria-label={`Añadir ${product.name} al carrito`}
                        className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-secondary-fixed transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          add_shopping_cart
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Página anterior"
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant disabled:opacity-40 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-label-md text-label-md transition-colors cursor-pointer tabular-nums ${
                    currentPage === page
                      ? 'bg-primary text-on-primary'
                      : 'hover:bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Página siguiente"
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant disabled:opacity-40 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
