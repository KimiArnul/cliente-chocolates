/**
 * Modelos de dominio y contratos DTO compatibles con la especificación oficial de ASP.NET Core / .NET 10 Web API.
 */

export type ViewRoute =
  | 'home'
  | 'catalog'
  | 'product-detail'
  | 'checkout'
  | 'order-tracking'
  | 'story'
  | 'contact'
  | 'faq';

export type CollectionCategory = string;

// ------------------------------------------------------------------
// 1. CONTRATOS OFICIALES BACKEND .NET 10 (Documentación de API)
// ------------------------------------------------------------------

/**
 * ProductoDto tal como lo devuelve GET /api/products y GET /api/products/{id}
 */
export interface BackendProductoDto {
  id: number;
  idCategoria: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string | null;
  esDestacado: boolean;
  stock: number;
  activo: boolean;
}

export interface CategoriaDto {
  id: number;
  nombre: string;
  descripcion: string | null;
}

/**
 * PromocionDto devuelto por GET /api/promotions/active
 */
export interface PromocionDto {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: 'Temporada' | 'Producto' | 'Categoria' | 'Combo' | 'Cupon' | string;
  tipoDescuento: 'Porcentaje' | 'MontoFijo' | string;
  descuento: number;
  precioCombo: number | null;
  cupon: string | null;
  compraMinima: number | null;
  limiteUsos: number | null;
  usosRealizados: number;
  idCategoria: number | null;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  productos: any[];
  // Alias de conveniencia para frontend
  code?: string;
  bannerText?: string;
  description?: string;
}

export interface BackendOrderTrackingDto {
  numeroOrden: string;
  estado: string;
  fechaCreacion: string;
  fechaEntrega: string;
  total: number;
  detalles: {
    productoId: number;
    nombreProducto: string;
    precioUnitario: number;
    cantidad: number;
    subtotal: number;
  }[];
}

export interface BackendAboutContentDto {
  nombreEmpresa: string;
  descripcion: string;
  mision: string | null;
  vision: string | null;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  horarioAtencion: string | null;
}

export interface BackendFaqItemDto {
  id: number;
  pregunta: string;
  respuesta: string;
}

/**
 * Request para POST /api/promotions/validate-coupon
 */
export interface ValidarCuponRequestDto {
  codigo: string;
  subtotal: number;
}

/**
 * Response de POST /api/promotions/validate-coupon (200 OK y 400 Bad Request)
 */
export interface ValidarCuponResponseDto {
  valido: boolean;
  mensaje: string;
  codigo: string | null;
  tipoDescuento: 'Porcentaje' | 'MontoFijo' | null;
  valor: number;
  montoDescuento: number;
  totalConDescuento: number;
}

/**
 * Request para POST /api/cart/calculate
 */
export interface ItemCarritoRequestDto {
  productoId: number;
  cantidad: number;
}

export interface CalcularCarritoRequestDto {
  items: ItemCarritoRequestDto[];
  codigoCupon?: string | null;
}

export interface ItemCarritoCalculadoDto {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  existenciasDisponibles: number;
}

/**
 * Response de POST /api/cart/calculate
 */
export interface CalcularCarritoResponseDto {
  items: ItemCarritoCalculadoDto[];
  subtotal: number;
  descuento: number;
  total: number;
  codigoCupon: string | null;
  promocionesAplicadas: string[];
}

/**
 * Request para POST /api/checkout/simulate-payment
 */
export interface SimularPagoRequestDto {
  numeroTarjeta: string;
  fechaExpiracion: string; // Formato "MM/yy", ej. "12/30"
  cvv: string;
  monto: number;
}

/**
 * Response de POST /api/checkout/simulate-payment (200 OK y 400 Bad Request)
 */
export interface SimularPagoResponseDto {
  aprobado: boolean;
  mensaje: string;
  referencia: string | null;
  monto: number;
}

/**
 * Request para POST /api/orders (Creación de pedidos Guest)
 */
export interface CrearPedidoRequestDto {
  nombreCliente: string;
  correoCliente: string;
  telefonoCliente?: string | null;
  fechaEntrega: string; // ISO 8601
  comentarios?: string | null;
  items: {
    productoId: number;
    cantidad: number;
  }[];
  codigoCupon?: string | null;
  pago: {
    numeroTarjeta: string;
    fechaExpiracion: string;
    cvv: string;
    monto: number;
  };
}

/**
 * Response 201 Created de POST /api/orders
 */
export interface PedidoCreadoResponseDto {
  id: number;
  numeroOrden: string;
  estado: string; // ej. "Pendiente"
  subtotal: number;
  descuento: number;
  total: number;
  referenciaPago: string;
  fechaCreacion: string;
}

// ------------------------------------------------------------------
// 2. MODELOS ADAPTADOS PARA LA EXPERIENCIA DE FRONTEND
// ------------------------------------------------------------------

/**
 * Modelo adaptado que unifica la respuesta de la API con los elementos visuales
 * (imágenes locales aleatorias, notas de cata y alérgenos).
 */
export interface ProductDto {
  id: number;
  idCategoria: number;
  nombre: string;
  name: string; // Alias de conveniencia
  descripcion: string;
  shortDescription: string; // Alias
  fullDescription: string;
  subtitle?: string; // Subtítulo opcional de presentación
  precio: number;
  price: number; // Alias
  imagenUrl: string | null;
  mainImage: string; // Imagen local resuelta desde /images/chocolates/
  galleryImages: string[];
  esDestacado: boolean;
  isFeatured: boolean;
  isHeroBento?: boolean;
  stock: number;
  activo: boolean;
  category: CollectionCategory;
  badge?: string;
  cacaoPercentage: number;
  rating: number;
  reviewsCount: number;
  ingredients: string[];
  allergenNote: string;
  shippingAndCare: string;
  weightOrCount: string;
}

export type PromotionDto = PromocionDto;

export interface ShippingAddressDto {
  email: string;
  newsletter?: boolean;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  postalCode: string;
  city: string;
  province: string;
  phone?: string;
}

export interface PaymentDetailsDto {
  method?: string;
  cardNumber: string;
  cardHolderName?: string;
  expiryDate: string;
  cvv: string;
}

export interface CartItemDto {
  productId: number;
  product: ProductDto;
  quantity: number;
}

// Modelos para seguimiento (preparados para implementación futura del backend)
export interface TrackingStepDto {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: string;
}

export interface OrderItemSummaryDto {
  productId: number;
  name: string;
  subtitle: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: string;
}

export interface OrderTrackingDto {
  orderNumber: string;
  placedDate: string;
  statusLabel: string;
  shippingAddress: {
    recipientName: string;
    line1: string;
    line2?: string;
    cityStateZip: string;
  };
  steps: TrackingStepDto[];
  items: OrderItemSummaryDto[];
  subtotal: number;
  shippingCost: number;
  discountAmount?: number;
  total: number;
  bannerImage: string;
}

// Modelos para contenido institucional y preguntas frecuentes (preparados para futuro backend)
export interface AboutContentDto {
  title: string;
  subtitle: string;
  story: string;
  craftsmanship: string;
  originPillars: {
    step: string;
    title: string;
    description: string;
  }[];
}

export interface FaqItemDto {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface ProductsQueryResult {
  products: ProductDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
