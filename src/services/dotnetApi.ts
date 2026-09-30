import {
  AboutContentDto,
  BackendAboutContentDto,
  BackendFaqItemDto,
  BackendOrderTrackingDto,
  BackendProductoDto,
  CalcularCarritoRequestDto,
  CalcularCarritoResponseDto,
  CategoriaDto,
  CrearPedidoRequestDto,
  FaqItemDto,
  OrderTrackingDto,
  PedidoCreadoResponseDto,
  ProductDto,
  ProductsQueryResult,
  PromocionDto,
  SimularPagoRequestDto,
  SimularPagoResponseDto,
  ValidarCuponRequestDto,
  ValidarCuponResponseDto,
} from '../types/models';
import { resolveProductImage, getRandomSampleImage } from './sampleImages';

/**
 * URL base para la API .NET 10.
 * En desarrollo local con proxy de Express se utiliza '/api'.
 * Si se invoca directamente Kestrel, puede definirse VITE_DOTNET_API_URL="https://localhost:7076/api" o "http://localhost:5000/api".
 */
export const DOTNET_API_BASE_URL =
  import.meta.env.VITE_DOTNET_API_URL || '/api';

/**
 * Diccionario de rutas exactas definidas en la documentación oficial de Chocolates SV (.NET 10).
 */
export const DOTNET_ENDPOINTS = {
  // 1. Catálogo
  products: {
    getAll: `${DOTNET_API_BASE_URL}/products`,
    getFeatured: `${DOTNET_API_BASE_URL}/products/featured`,
    getById: (id: number | string) =>
      `${DOTNET_API_BASE_URL}/products/${encodeURIComponent(id)}`,
  },
  // 2. Promociones
  promotions: {
    getActive: `${DOTNET_API_BASE_URL}/promotions/active`,
    validateCoupon: `${DOTNET_API_BASE_URL}/promotions/validate-coupon`,
  },
  // 3. Carrito y Checkout
  cart: {
    calculate: `${DOTNET_API_BASE_URL}/cart/calculate`,
  },
  checkout: {
    simulatePayment: `${DOTNET_API_BASE_URL}/checkout/simulate-payment`,
  },
  orders: {
    create: `${DOTNET_API_BASE_URL}/orders`,
    tracking: `${DOTNET_API_BASE_URL}/orders/tracking`,
  },
  categories: `${DOTNET_API_BASE_URL}/categories`,
  content: {
    about: `${DOTNET_API_BASE_URL}/content/about`,
    faq: `${DOTNET_API_BASE_URL}/content/faq`,
  },
} as const;

/**
 * Adaptador que transforma un BackendProductoDto a ProductDto unificado para el frontend,
 * resolviendo las imágenes locales desde /public/images/chocolates/... aleatoriamente
 * según el requerimiento.
 */
export function adaptBackendProduct(p: BackendProductoDto | any): ProductDto {
  const numId = typeof p.id === 'number' ? p.id : parseInt(p.id, 10) || 1;
  const imagenResuelta = resolveProductImage(p.imagenUrl || p.mainImage, numId);

  // Mapeo amigable de categoría por idCategoria
  let categoryName: ProductDto['category'] = 'Trufas Artesanales';
  if (p.idCategoria === 2) categoryName = 'Barras Origen Único';
  else if (p.idCategoria === 3) categoryName = 'Ediciones Limitadas';
  else if (p.category) categoryName = p.category;

  const nombre = p.nombre || p.name || 'Chocolate Artesanal';
  const descripcion = p.descripcion || p.shortDescription || '';
  const precio = typeof p.precio === 'number' ? p.precio : typeof p.price === 'number' ? p.price : 5.50;

  return {
    id: numId,
    idCategoria: p.idCategoria || 1,
    nombre,
    name: nombre,
    descripcion,
    shortDescription: descripcion,
    fullDescription: p.fullDescription || descripcion,
    precio,
    price: precio,
    imagenUrl: p.imagenUrl || null,
    mainImage: imagenResuelta,
    galleryImages: [
      imagenResuelta,
      getRandomSampleImage(numId + 10),
      getRandomSampleImage(numId + 20),
    ],
    esDestacado: Boolean(p.esDestacado ?? p.isFeatured),
    isFeatured: Boolean(p.esDestacado ?? p.isFeatured),
    isHeroBento: Boolean(p.isHeroBento),
    stock: typeof p.stock === 'number' ? p.stock : 25,
    activo: p.activo !== false,
    category: categoryName,
    badge: p.badge || (p.esDestacado ? 'Destacado' : undefined),
    cacaoPercentage: p.cacaoPercentage || 70,
    rating: p.rating || 4.8,
    reviewsCount: p.reviewsCount || 24,
    ingredients: p.ingredients || [
      'Pasta de cacao criollo',
      'Manteca de cacao pura',
      'Azúcar orgánica de caña',
    ],
    allergenNote: p.allergenNote || 'Puede contener trazas de frutos secos y leche.',
    shippingAndCare:
      p.shippingAndCare ||
      'Conservar en un lugar fresco y seco (15°C - 18°C). Envío con control térmico.',
    weightOrCount: p.weightOrCount || 'Presentación artesanal',
  };
}

function adaptOrderTracking(order: BackendOrderTrackingDto): OrderTrackingDto {
  const steps = ['Pendiente', 'Confirmado', 'En Preparacion', 'Enviado', 'Entregado', 'Cancelado'];
  const currentIndex = steps.indexOf(order.estado);
  return {
    orderNumber: order.numeroOrden,
    placedDate: new Date(order.fechaCreacion).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric',
    }),
    statusLabel: order.estado,
    shippingAddress: { recipientName: '', line1: '', cityStateZip: '' },
    steps: steps.slice(0, 5).map((title, index) => ({
      id: `step-${index + 1}`,
      title,
      timestamp: index <= currentIndex ? 'Actualizado' : 'Pendiente',
      description: index <= currentIndex ? 'Estado confirmado por el backend.' : 'Aún no iniciado.',
      status: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'pending',
      icon: index === 0 ? 'schedule' : index === 1 ? 'check' : index === 2 ? 'inventory_2' : 'local_shipping',
    })),
    items: order.detalles.map((item) => ({
      productId: item.productoId,
      name: item.nombreProducto,
      subtitle: `Cantidad: ${item.cantidad}`,
      quantity: item.cantidad,
      unitPrice: item.precioUnitario,
      lineTotal: item.subtotal,
      image: resolveProductImage(null, item.productoId),
    })),
    subtotal: order.detalles.reduce((sum, item) => sum + item.subtotal, 0),
    shippingCost: 0,
    total: order.total,
    bannerImage: '',
  };
}

function adaptAboutContent(content: BackendAboutContentDto): AboutContentDto {
  return {
    title: content.nombreEmpresa,
    subtitle: content.descripcion,
    story: content.descripcion,
    craftsmanship: [content.mision, content.vision].filter(Boolean).join(' '),
    originPillars: [
      content.mision && { step: 'Misión', title: 'Nuestra misión', description: content.mision },
      content.vision && { step: 'Visión', title: 'Nuestra visión', description: content.vision },
      content.direccion && { step: 'Dirección', title: 'Atelier', description: content.direccion },
      content.correo && { step: 'Correo', title: 'Correo', description: content.correo },
      content.telefono && { step: 'Teléfono', title: 'Teléfono', description: content.telefono },
      content.horarioAtencion && { step: 'Atención', title: 'Horario', description: content.horarioAtencion },
    ].filter(Boolean) as AboutContentDto['originPillars'],
  };
}

/**
 * Cliente HTTP oficial para consumir la API .NET 10 de Chocolates SV
 */
export const ChocolatesSvApi = {
  // -------------------------------------------------------------
  // 1. CATÁLOGO DE PRODUCTOS (Documentación Sección 1)
  // -------------------------------------------------------------

  /**
   * GET /api/products
   * Devuelve todos los productos activos disponibles para el catálogo.
   * "Actualmente el endpoint no recibe parámetros de búsqueda, filtros ni paginación."
   * Si la API está corriendo en local, se conecta a ella. De lo contrario, usa los datos de respaldo.
   */
  async getAllProducts(): Promise<ProductDto[]> {
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3500);

      const res = await fetch(DOTNET_ENDPOINTS.products.getAll, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (res.ok) {
        const rawList = await res.json();
        const list = Array.isArray(rawList)
          ? rawList
          : rawList?.data && Array.isArray(rawList.data)
          ? rawList.data
          : null;

        if (list) {
          return list.map(adaptBackendProduct);
        }
      }
    } catch {
      // Usar respaldo en memoria si la API local no está iniciada
    }

    throw new Error('No se pudo cargar el catálogo de productos.');
  },

  /**
   * GET /api/products/featured
   * Devuelve los productos activos marcados como destacados para el Home.
   */
  async getFeaturedProducts(): Promise<ProductDto[]> {
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3500);

      const res = await fetch(DOTNET_ENDPOINTS.products.getFeatured, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (res.ok) {
        const rawList = await res.json();
        const list = Array.isArray(rawList)
          ? rawList
          : rawList?.data && Array.isArray(rawList.data)
          ? rawList.data
          : null;

        if (list) {
          return list.map(adaptBackendProduct);
        }
      }
    } catch {
      // Fallback
    }

    throw new Error('No se pudieron cargar los productos destacados.');
  },

  /**
   * GET /api/products/{id}
   * Devuelve el objeto ProductoDto correspondiente.
   */
  async getProductById(id: number | string): Promise<ProductDto> {
    const numId = typeof id === 'number' ? id : parseInt(id, 10) || 1;
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3500);

      const res = await fetch(DOTNET_ENDPOINTS.products.getById(numId), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (res.ok) {
        const item = await res.json();
        const raw = item?.data ? item.data : item;
        return adaptBackendProduct(raw);
      }
    } catch {
      // Fallback
    }

    throw new Error('No se pudo cargar el producto solicitado.');
  },

  /**
   * Helper de cliente: Obtiene productos y aplica filtros en el frontend
   * respetando que el endpoint GET /api/products devuelve la colección completa sin filtros server-side.
   */
  async getProductsPaged(params?: {
    category?: string;
    minCacao?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<ProductsQueryResult> {
    const all = await this.getAllProducts();

    let filtered = [...all];
    if (params?.category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === params.category!.toLowerCase()
      );
    }
    if (params?.minCacao) {
      filtered = filtered.filter((p) => p.cacaoPercentage >= params.minCacao!);
    }
    if (params?.maxPrice) {
      filtered = filtered.filter((p) => p.precio <= params.maxPrice!);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (params?.sort === 'price-asc') {
      filtered.sort((a, b) => a.precio - b.precio);
    } else if (params?.sort === 'price-desc') {
      filtered.sort((a, b) => b.precio - a.precio);
    } else if (params?.sort === 'novedades') {
      filtered.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 6;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
      products: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  },

  /**
   * Productos relacionados para la vista de detalle
   */
  async getRelatedProducts(currentId: number | string): Promise<ProductDto[]> {
    const all = await this.getAllProducts();
    const numId = typeof currentId === 'number' ? currentId : parseInt(currentId, 10);
    return all.filter((p) => p.id !== numId).slice(0, 4);
  },

  // -------------------------------------------------------------
  // 2. PROMOCIONES Y CUPONES (Documentación Sección 2)
  // -------------------------------------------------------------

  /**
   * GET /api/promotions/active
   * Devuelve las promociones activas y vigentes.
   */
  async getActivePromotions(): Promise<PromocionDto[]> {
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3500);

      const res = await fetch(DOTNET_ENDPOINTS.promotions.getActive, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (res.ok) {
        const raw = await res.json();
      return Array.isArray(raw) ? raw : raw?.data || [];
      }
    } catch {
      // Fallback
    }

    throw new Error('No se pudieron cargar las promociones activas.');
  },

  /**
   * POST /api/promotions/validate-coupon
   * Body: { "codigo": "DULCE10", "subtotal": 25.00 }
   * Respuesta 200 OK (valido: true) o 400 Bad Request (valido: false).
   */
  async validateCoupon(codigo: string, subtotal: number): Promise<ValidarCuponResponseDto> {
    const payload: ValidarCuponRequestDto = {
      codigo: codigo.trim().toUpperCase(),
      subtotal: Math.max(0.01, subtotal),
    };

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3500);

      const res = await fetch(DOTNET_ENDPOINTS.promotions.validateCoupon, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      const data = await res.json();
      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('No se pudo validar el cupón.');
    }
  },

  // -------------------------------------------------------------
  // 3. CARRITO (Documentación Sección 3)
  // -------------------------------------------------------------

  /**
   * POST /api/cart/calculate
   * Body: { items: [{ productoId: 1, cantidad: 2 }], codigoCupon?: "DULCE10" }
   */
  async calculateCart(
    items: { productoId: number; cantidad: number }[],
    codigoCupon?: string | null
  ): Promise<CalcularCarritoResponseDto> {
    const payload: CalcularCarritoRequestDto = {
      items,
      codigoCupon: codigoCupon?.trim() || null,
    };

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3500);

      const res = await fetch(DOTNET_ENDPOINTS.cart.calculate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('No se pudo calcular el carrito.');
    }

    throw new Error('No se pudo calcular el carrito.');
  },

  // -------------------------------------------------------------
  // 4. PAGO SIMULADO (Documentación Sección 4)
  // -------------------------------------------------------------

  /**
   * POST /api/checkout/simulate-payment
   * Body: { numeroTarjeta: string, fechaExpiracion: string, cvv: string, monto: number }
   */
  async simulatePayment(data: SimularPagoRequestDto): Promise<SimularPagoResponseDto> {
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3500);

      const res = await fetch(DOTNET_ENDPOINTS.checkout.simulatePayment, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      const json = await res.json();
      return json;
    } catch (error) {
      throw error instanceof Error ? error : new Error('No se pudo simular el pago.');
    }
  },

  // -------------------------------------------------------------
  // 5. CREACIÓN DE PEDIDOS GUEST (Documentación Sección 5)
  // -------------------------------------------------------------

  /**
   * POST /api/orders
   * Body: CrearPedidoRequestDto
   * Respuesta 201 Created: PedidoCreadoResponseDto
   */
  async createOrder(request: CrearPedidoRequestDto): Promise<PedidoCreadoResponseDto> {
    const res = await fetch(DOTNET_ENDPOINTS.orders.create, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || 'No se pudo crear el pedido.');
    }
    return data;
  },

  // -------------------------------------------------------------
  // 6. SEGUIMIENTO, CONTENIDO Y CATEGORÍAS
  // -------------------------------------------------------------

  /**
   * Consulta el seguimiento de un pedido por su número de orden.
   * Si el endpoint en .NET está activo, lo consulta; si aún no tiene controlador en C#,
   * retorna los datos guardados en la sesión o el pedido de demostración.
   */
  async trackOrder(numeroOrden: string, correo: string): Promise<OrderTrackingDto> {
    const res = await fetch(DOTNET_ENDPOINTS.orders.tracking, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ numeroOrden: numeroOrden.trim(), correo: correo.trim() }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || 'No se encontró el pedido.');
    return adaptOrderTracking(data as BackendOrderTrackingDto);
  },

  async getCategories(): Promise<CategoriaDto[]> {
    const res = await fetch(DOTNET_ENDPOINTS.categories, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('No se pudieron cargar las categorías.');
    return await res.json();
  },

  /**
   * GET /api/content/about (Preparado para cuando el controlador esté implementado)
   */
  async getAboutContent(): Promise<AboutContentDto> {
    const res = await fetch(DOTNET_ENDPOINTS.content.about, { headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || 'No se pudo cargar la información institucional.');
    return adaptAboutContent(data as BackendAboutContentDto);
  },

  /**
   * GET /api/content/faq (Preparado para cuando el controlador esté implementado)
   */
  async getFaqList(): Promise<FaqItemDto[]> {
    const res = await fetch(DOTNET_ENDPOINTS.content.faq, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('No se pudieron cargar las preguntas frecuentes.');
    const data: BackendFaqItemDto[] = await res.json();
    return data.map((item) => ({ id: String(item.id), question: item.pregunta, answer: item.respuesta }));
  },
};
