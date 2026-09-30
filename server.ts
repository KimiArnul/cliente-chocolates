import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import https from 'https';
import {
  INITIAL_PRODUCTS,
  INITIAL_PROMOTIONS,
  ABOUT_CONTENT,
  INITIAL_FAQS,
  DEFAULT_ORDER_TRACKING,
} from './src/data/mockDatabase.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// URL configurada de la API .NET 10 (por defecto https://localhost:7076 o http://localhost:5000)
const EXTERNAL_DOTNET_API =
  process.env.DOTNET_BACKEND_URL ||
  (process.env.VITE_DOTNET_API_URL?.startsWith('http')
    ? process.env.VITE_DOTNET_API_URL
    : 'https://localhost:7076/api');

app.use(express.json());

// Base de datos en memoria sincronizada con los contratos de C# / .NET 10
let productsDatabase = [...INITIAL_PRODUCTS];
let promotionsDatabase = [...INITIAL_PROMOTIONS];
let ordersDatabase: Record<string, any> = {
  'ORD-AI847291': DEFAULT_ORDER_TRACKING,
};

// Encabezados CORS para máxima flexibilidad en desarrollo local
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Agente HTTPS que ignora certificados autofirmados de desarrollo local en ASP.NET Core
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Proxy a la API externa de .NET 10 si se encuentra encendida en local
async function proxyToDotNet(
  req: Request,
  res: Response,
  targetPath: string
): Promise<boolean> {
  if (!EXTERNAL_DOTNET_API || EXTERNAL_DOTNET_API.startsWith('/api')) {
    return false;
  }
  try {
    const url = `${EXTERNAL_DOTNET_API.replace(/\/$/, '')}${targetPath}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const externalRes = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method)
        ? JSON.stringify(req.body)
        : undefined,
      signal: controller.signal,
      // @ts-ignore
      agent: url.startsWith('https') ? httpsAgent : undefined,
    });
    clearTimeout(timer);

    if (externalRes.ok) {
      const data = await externalRes.json();
      res.status(externalRes.status).json(data);
      return true;
    }
    return false;
  } catch {
    // Si la API .NET está apagada o no responde, el servidor local atiende la solicitud
    return false;
  }
}

// -------------------------------------------------------------
// 1. CATÁLOGO DE PRODUCTOS (Documentación Sección 1)
// -------------------------------------------------------------

/**
 * 1.1 GET /api/products
 * Devuelve todos los productos activos disponibles para el catálogo.
 * Devuelve array directo de ProductoDto.
 */
app.get('/api/products', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, '/products');
  if (proxied) return;

  const activeProducts = productsDatabase
    .filter((p) => p.activo !== false)
    .map((p) => ({
      id: p.id,
      idCategoria: p.idCategoria,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      imagenUrl: p.imagenUrl,
      esDestacado: p.esDestacado,
      stock: p.stock,
      activo: p.activo,
    }));

  res.json(activeProducts);
});

/**
 * 1.2 GET /api/products/featured
 * Devuelve los productos activos marcados como destacados.
 */
app.get('/api/products/featured', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, '/products/featured');
  if (proxied) return;

  const featured = productsDatabase
    .filter((p) => (p.esDestacado || p.isFeatured) && p.activo !== false)
    .map((p) => ({
      id: p.id,
      idCategoria: p.idCategoria,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      imagenUrl: p.imagenUrl,
      esDestacado: p.esDestacado,
      stock: p.stock,
      activo: p.activo,
    }));

  res.json(featured);
});

/**
 * 1.3 GET /api/products/{id}
 * Devuelve un objeto ProductoDto específico o 404 Not Found.
 */
app.get('/api/products/:id', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, `/products/${req.params.id}`);
  if (proxied) return;

  const searchId = parseInt(req.params.id, 10);
  const product = productsDatabase.find(
    (p) => p.id === searchId || p.id.toString() === req.params.id
  );

  if (!product || product.activo === false) {
    return res.status(404).json({
      message: 'Producto no encontrado',
    });
  }

  res.json({
    id: product.id,
    idCategoria: product.idCategoria,
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: product.precio,
    imagenUrl: product.imagenUrl,
    esDestacado: product.esDestacado,
    stock: product.stock,
    activo: product.activo,
  });
});

// -------------------------------------------------------------
// 2. PROMOCIONES Y CUPONES (Documentación Sección 2)
// -------------------------------------------------------------

/**
 * 2.1 GET /api/promotions/active
 * Devuelve las promociones activas y vigentes en la fecha actual.
 */
app.get('/api/promotions/active', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, '/promotions/active');
  if (proxied) return;

  const activePromos = promotionsDatabase.filter((p) => p.activa);
  res.json(activePromos);
});

/**
 * 2.2 POST /api/promotions/validate-coupon
 * Body: { codigo: "DULCE10", subtotal: 25.00 }
 */
app.post('/api/promotions/validate-coupon', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, '/promotions/validate-coupon');
  if (proxied) return;

  const { codigo = '', subtotal = 0 } = req.body || {};
  const norm = (codigo || '').trim().toUpperCase();
  const subNum = Number(subtotal) || 0;

  if (norm === 'DULCE10' || norm === 'SV10' || norm === 'CHOCO10') {
    const descAmount = Number((subNum * 0.1).toFixed(2));
    return res.json({
      valido: true,
      mensaje: 'Cupón aplicado correctamente',
      codigo: norm,
      tipoDescuento: 'Porcentaje',
      valor: 10.0,
      montoDescuento: descAmount,
      totalConDescuento: Number((subNum - descAmount).toFixed(2)),
    });
  }

  if (norm === 'CACAO15') {
    const descAmount = Number((subNum * 0.15).toFixed(2));
    return res.json({
      valido: true,
      mensaje: 'Cupón de Temporada aplicado correctamente',
      codigo: norm,
      tipoDescuento: 'Porcentaje',
      valor: 15.0,
      montoDescuento: descAmount,
      totalConDescuento: Number((subNum - descAmount).toFixed(2)),
    });
  }

  // Cupón inválido: 400 Bad Request según la documentación
  return res.status(400).json({
    valido: false,
    mensaje: 'El cupón no existe',
    codigo: null,
    tipoDescuento: null,
    valor: 0,
    montoDescuento: 0,
    totalConDescuento: 0,
  });
});

// -------------------------------------------------------------
// 3. CARRITO (Documentación Sección 3)
// -------------------------------------------------------------

/**
 * 3.1 POST /api/cart/calculate
 * Body: { items: [{ productoId: 1, cantidad: 2 }], codigoCupon: "DULCE10" }
 */
app.post('/api/cart/calculate', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, '/cart/calculate');
  if (proxied) return;

  const { items = [], codigoCupon } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: 'Debe contener al menos un elemento',
    });
  }

  let subtotal = 0;
  const calculatedItems = [];

  for (const item of items) {
    const prod = productsDatabase.find((p) => p.id === item.productoId);
    if (!prod || prod.activo === false) {
      return res.status(404).json({
        message: `El producto ${item.productoId} no existe o está inactivo`,
      });
    }

    if (item.cantidad > prod.stock) {
      return res.status(409).json({
        message: `Stock insuficiente para el producto ${prod.nombre}`,
      });
    }

    const lineSubtotal = Number((prod.precio * item.cantidad).toFixed(2));
    subtotal += lineSubtotal;

    calculatedItems.push({
      productoId: prod.id,
      nombre: prod.nombre,
      precioUnitario: prod.precio,
      cantidad: item.cantidad,
      subtotal: lineSubtotal,
      existenciasDisponibles: prod.stock,
    });
  }

  let descuento = 0;
  const promocionesAplicadas: string[] = [];

  if (codigoCupon) {
    const norm = codigoCupon.trim().toUpperCase();
    if (norm === 'DULCE10' || norm === 'SV10') {
      descuento = Number((subtotal * 0.1).toFixed(2));
      promocionesAplicadas.push('Cupón Bienvenida');
    } else if (norm === 'CACAO15') {
      descuento = Number((subtotal * 0.15).toFixed(2));
      promocionesAplicadas.push('Temporada Cacao Sagrado');
    }
  }

  // Limitar descuento para que no supere el subtotal
  descuento = Math.min(descuento, subtotal);
  const total = Number(Math.max(0, subtotal - descuento).toFixed(2));

  res.json({
    items: calculatedItems,
    subtotal: Number(subtotal.toFixed(2)),
    descuento,
    total,
    codigoCupon: descuento > 0 ? codigoCupon : null,
    promocionesAplicadas,
  });
});

// -------------------------------------------------------------
// 4. PAGO SIMULADO (Documentación Sección 4)
// -------------------------------------------------------------

/**
 * 4.1 POST /api/checkout/simulate-payment
 * Body: { numeroTarjeta: "4111...", fechaExpiracion: "12/30", cvv: "123", monto: 25.50 }
 */
app.post('/api/checkout/simulate-payment', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, '/checkout/simulate-payment');
  if (proxied) return;

  const { numeroTarjeta = '', fechaExpiracion = '', cvv = '', monto = 0 } = req.body || {};
  const cleanCard = numeroTarjeta.replace(/\D/g, '');

  if (cleanCard.length < 13 || cleanCard.length > 19 || cleanCard.endsWith('0000')) {
    return res.status(400).json({
      aprobado: false,
      mensaje: 'Los datos del pago no tienen un formato válido o la tarjeta fue declinada',
      referencia: null,
      monto,
    });
  }

  const randomRef = `SIM-ABC${Math.floor(100000 + Math.random() * 900000)}`;

  res.json({
    aprobado: true,
    mensaje: 'Pago simulado aprobado',
    referencia: randomRef,
    monto,
  });
});

// -------------------------------------------------------------
// 5. CREACIÓN DE PEDIDOS GUEST (Documentación Sección 5)
// -------------------------------------------------------------

/**
 * 5.1 POST /api/orders
 * Body: CrearPedidoRequestDto
 * Respuesta 201 Created: PedidoCreadoResponseDto
 */
app.post('/api/orders', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, '/orders');
  if (proxied) return;

  const {
    nombreCliente,
    correoCliente,
    telefonoCliente,
    fechaEntrega,
    comentarios,
    items = [],
    codigoCupon,
    pago,
  } = req.body || {};

  if (!nombreCliente || !correoCliente || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: 'Los datos del pedido están incompletos.',
    });
  }

  // Recalcular subtotal y validar stock
  let subtotal = 0;
  for (const item of items) {
    const prod = productsDatabase.find((p) => p.id === item.productoId);
    if (!prod) {
      return res.status(404).json({
        message: `El producto ${item.productoId} no existe o está inactivo`,
      });
    }
    if (item.cantidad > prod.stock) {
      return res.status(409).json({
        message: `Stock insuficiente para el producto ${prod.nombre}`,
      });
    }
    subtotal += prod.precio * item.cantidad;
  }

  let descuento = 0;
  if (codigoCupon) {
    const norm = codigoCupon.trim().toUpperCase();
    if (norm === 'DULCE10' || norm === 'SV10') descuento = subtotal * 0.1;
    if (norm === 'CACAO15') descuento = subtotal * 0.15;
  }
  descuento = Number(descuento.toFixed(2));
  const total = Number((subtotal - descuento).toFixed(2));

  const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
  const numeroOrden = `ORD-${randomHex}`;
  const refPago = `SIM-ABC${Math.floor(100000 + Math.random() * 900000)}`;

  const createdOrder = {
    id: Math.floor(100 + Math.random() * 900),
    numeroOrden,
    estado: 'Pendiente',
    subtotal: Number(subtotal.toFixed(2)),
    descuento,
    total,
    referenciaPago: refPago,
    fechaCreacion: new Date().toISOString(),
  };

  // Guardar en base de datos local para seguimiento
  ordersDatabase[numeroOrden] = {
    orderNumber: numeroOrden,
    placedDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    statusLabel: 'En Preparación',
    shippingAddress: {
      recipientName: nombreCliente,
      line1: comentarios || 'Entrega estándar',
      cityStateZip: telefonoCliente ? `Tel: ${telefonoCliente}` : '',
    },
    steps: [
      {
        id: 'step-placed',
        title: 'Pedido Confirmado',
        timestamp: 'Hoy',
        description: `Confirmación enviada a ${correoCliente}.`,
        status: 'completed',
        icon: 'check',
      },
      {
        id: 'step-preparing',
        title: 'En Preparación',
        timestamp: 'En curso',
        description: 'Empacado con aislamiento térmico y sellos de calidad.',
        status: 'current',
        icon: 'inventory_2',
      },
      {
        id: 'step-shipped',
        title: 'En Camino',
        timestamp: `Entrega: ${new Date(fechaEntrega).toLocaleDateString('es-ES')}`,
        description: 'Despacho prioritario.',
        status: 'pending',
        icon: 'local_shipping',
      },
    ],
    items: items.map((i: any) => {
      const prod = productsDatabase.find((p) => p.id === i.productoId) || productsDatabase[0];
      return {
        productId: prod.id,
        name: prod.nombre,
        subtitle: `Cantidad: ${i.cantidad}`,
        quantity: i.cantidad,
        unitPrice: prod.precio,
        lineTotal: Number((prod.precio * i.cantidad).toFixed(2)),
        image: prod.mainImage,
      };
    }),
    subtotal: Number(subtotal.toFixed(2)),
    shippingCost: 0,
    discountAmount: descuento,
    total,
    bannerImage: DEFAULT_ORDER_TRACKING.bannerImage,
  };

  res.status(201).json(createdOrder);
});

// -------------------------------------------------------------
// 6. ENDPOINTS PREPARADOS PARA IMPLEMENTACIÓN FUTURA
// (Seguimiento, Contenido Institucional y FAQs)
// -------------------------------------------------------------

app.get('/api/orders/tracking/:numeroOrden', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, `/orders/tracking/${req.params.numeroOrden}`);
  if (proxied) return;

  const clean = req.params.numeroOrden.trim().toUpperCase();
  if (ordersDatabase[clean]) {
    return res.json(ordersDatabase[clean]);
  }

  res.status(404).json({ message: 'Pedido no encontrado' });
});

app.post('/api/orders/tracking', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, '/orders/tracking');
  if (proxied) return;

  const { orderNumber = '' } = req.body || {};
  const clean = orderNumber.trim().toUpperCase().replace('#', '');

  if (ordersDatabase[clean]) {
    return res.json({ found: true, order: ordersDatabase[clean] });
  }

  res.json({ found: true, order: { ...DEFAULT_ORDER_TRACKING, orderNumber: clean || 'ORD-AI847291' } });
});

app.get('/api/content/about', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, '/content/about');
  if (proxied) return;

  res.json(ABOUT_CONTENT);
});

app.get('/api/content/faq', async (req: Request, res: Response) => {
  const proxied = await proxyToDotNet(req, res, '/content/faq');
  if (proxied) return;

  res.json(INITIAL_FAQS);
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    mode: 'express-bridge-net10',
    databaseProductCount: productsDatabase.length,
    activeBackendUrl: EXTERNAL_DOTNET_API,
    timestamp: new Date().toISOString(),
  });
});

// Servir frontend con Vite en desarrollo o estáticos en producción
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`[Chocolates SV] API & Web running on port ${PORT}`);
  });
}

startServer();
