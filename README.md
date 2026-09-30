# Chocolates SV — Frontend & Guía de Integración con API .NET 10

Boutique de alta chocolatería artesanal desarrollada en **React 19 + TypeScript + Tailwind CSS v4 + Vite**, totalmente integrada con la **API de ASP.NET Core / .NET 10 (C#)** según la especificación técnica oficial.

---

## 📋 Índice
1. [Requisitos Previos del Sistema](#1-requisitos-previos-del-sistema)
2. [Estructura del Proyecto y Directorio de Imágenes](#2-estructura-del-proyecto-y-directorio-de-imágenes)
3. [Instalación y Configuración del Frontend en Local](#3-instalación-y-configuración-del-frontend-en-local)
4. [Ejecución en Local con la API en Local](#4-ejecución-en-local-con-la-api-en-local)
5. [Endpoints Oficiales de la API Implementados](#5-endpoints-oficiales-de-la-api-implementados)
6. [Manejo de Imágenes Locales y Aleatorias](#6-manejo-de-imágenes-locales-y-aleatorias)
7. [Endpoints Preparados para Futura Implementación](#7-endpoints-preparados-para-futura-implementación)
8. [Scripts Disponibles](#8-scripts-disponibles)
9. [Solución de Problemas Frecuentes](#9-solución-de-problemas-frecuentes)
10. [Guías y Documentos Complementarios](#10-guías-y-documentos-complementarios)

---

## 1. Requisitos Previos del Sistema

Para ejecutar este proyecto en tu máquina local necesitas:

### Para el Frontend (React 19 / Vite):
- **Node.js**: Versión **18.18.0 o superior** (Se recomienda **Node.js 20 LTS** o **22 LTS**).
  - Comprobar con: `node -v`
- **Gestor de paquetes**: `npm`, `pnpm`, `yarn` o `bun`.
- **Navegador web moderno**: Chrome, Edge, Firefox, Safari o Brave.

### Para la API en Local (C# / .NET 10):
- **.NET SDK**: Versión **10.0** (o .NET 8 / 9).
  - Comprobar con: `dotnet --version`
- **URL Base Local oficial**: `https://localhost:7076` (o `http://localhost:5000`).
- **IDE o Editor**: Visual Studio 2022/2025, VS Code con C# Dev Kit o Rider.

---

## 2. Estructura del Proyecto y Directorio de Imágenes

```text
├── .env.example              # Variables de entorno preconfiguradas
├── package.json              # Dependencias y scripts
├── tsconfig.json             # TypeScript con tipos estrictos
├── vite.config.ts            # Vite + plugin Tailwind CSS v4
├── public/                   # Directorio estático servido en la raíz
│   └── images/
│       ├── trufa_maracuya.svg # Imagen de ejemplo
│       └── chocolates/       # Directorio de imágenes de muestra locales:
│           ├── trufa-maracuya.svg
│           ├── trufa-noche-magica.svg
│           ├── barra-origen-madagascar.svg
│           ├── bombones-oro-artesanal.svg
│           ├── chocolate-blanco-vainilla.svg
│           ├── praline-avellana-tostada.svg
│           ├── caja-degustacion-herencia.svg
│           └── cacao-puro-85.svg
└── src/
    ├── App.tsx               # Orquestador principal de estado y rutas
    ├── services/
    │   ├── dotnetApi.ts      # Cliente HTTP de consumo oficial de la API .NET 10
    │   └── sampleImages.ts   # Resolver de imágenes locales aleatorias
    ├── types/
    │   └── models.ts         # Contratos DTO exactos en camelCase de C#
    ├── components/           # Navbar, Footer, CartDrawer, SmartImage
    └── views/                # HomeView, CatalogView, ProductDetailView, CheckoutView...
```

---

## 3. Instalación y Configuración del Frontend en Local

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/KimiArnul/cliente-chocolates
cd chocolates-sv
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar variables de entorno
Copia la plantilla `.env.example`:
```bash
copy .env.example .env
```

Configura tu archivo `.env` con la URL de la API .NET local:

```env
VITE_DOTNET_API_URL="https://localhost:7076/api"
```

### Paso 4: Iniciar el Frontend

```bash
npm run dev
```

Para cualquier problema que se presente en la implementación, de ser necesario, ejecute esta seríe de comandos:

```bash
npm run lint
npm run build
npm run dev
```

### Paso 5: Abrir la aplicación
Ingresa a: **[http://localhost:3000](http://localhost:3000)**

---

## 4. Ejecución en Local con la API en Local

Para ejecutar el **Frontend (React)** conectado a la **API local (.NET 10)**:

1. **Inicia tu API .NET 10:**
  ```bash
  cd ruta/al/backend/ChocolatesSv.Api
  dotnet run
  ```

### Configurar Vite para Kestrel

1. **Verifica los puertos en `Properties/launchSettings.json`:**
   ```json
   "applicationUrl": "https://localhost:7076;http://localhost:5218"
   ```

2. **Confía en el certificado SSL de desarrollo:**
   ```bash
   dotnet dev-certs https --trust
   ```

3. **Configura `.env` en el Frontend:**
   ```env
   VITE_DOTNET_API_URL="https://localhost:7076/api"
   ```

4. **Inicia Vite:**
   ```bash
   npm run dev
   ```

---

## 5. Endpoints Oficiales de la API Implementados

El frontend consume la API siguiendo los contratos exactos documentados:

### 1. Catálogo de Productos
- **`GET /api/products`**
  - Devuelve todos los productos activos en un array:
    ```json
    [
      {
        "id": 1,
        "idCategoria": 1,
        "nombre": "Trufas de Maracuyá",
        "descripcion": "Caja de 6 trufas rellenas de ganache de maracuyá.",
        "precio": 5.50,
        "imagenUrl": "/images/trufa_maracuya.jpg",
        "esDestacado": true,
        "stock": 50,
        "activo": true
      }
    ]
    ```
- **`GET /api/products/featured`**
  - Devuelve los productos con `esDestacado: true` para el carrusel de inicio.
- **`GET /api/products/{id}`**
  - Devuelve el `ProductoDto` con el ID correspondiente o `404 Not Found`.

### 2. Promociones y Cupones
- **`GET /api/promotions/active`**
  - Devuelve las promociones vigentes (`id`, `nombre`, `tipo`, `tipoDescuento`, `descuento`, `cupon`, `compraMinima`, etc.).
- **`POST /api/promotions/validate-coupon`**
  - **Body**: `{ "codigo": "DULCE10", "subtotal": 25.00 }`
  - **Respuesta 200 OK**: `{ "valido": true, "mensaje": "...", "codigo": "DULCE10", "tipoDescuento": "Porcentaje", "valor": 10.0, "montoDescuento": 2.50, "totalConDescuento": 22.50 }`
  - **Respuesta 400 Bad Request**: `{ "valido": false, "mensaje": "El cupón no existe", ... }`

### 3. Carrito
- **`POST /api/cart/calculate`**
  - **Body**:
    ```json
    {
      "items": [
        { "productoId": 1, "cantidad": 2 }
      ],
      "codigoCupon": "DULCE10"
    }
    ```
  - **Respuesta 200 OK**:
    ```json
    {
      "items": [
        {
          "productoId": 1,
          "nombre": "Trufas de Maracuyá",
          "precioUnitario": 5.50,
          "cantidad": 2,
          "subtotal": 11.00,
          "existenciasDisponibles": 50
        }
      ],
      "subtotal": 11.00,
      "descuento": 1.10,
      "total": 9.90,
      "codigoCupon": "DULCE10",
      "promocionesAplicadas": ["Cupón Bienvenida"]
    }
    ```

### 4. Pago Simulado
- **`POST /api/checkout/simulate-payment`**
  - **Body**: `{ "numeroTarjeta": "4111...", "fechaExpiracion": "12/30", "cvv": "123", "monto": 25.50 }`
  - **Respuesta 200 OK**: `{ "aprobado": true, "mensaje": "Pago simulado aprobado", "referencia": "SIM-ABC123...", "monto": 25.50 }`

### 5. Creación de Pedidos Guest
- **`POST /api/orders`**
  - **Body**:
    ```json
    {
      "nombreCliente": "Juan Pérez",
      "correoCliente": "juan.perez@email.com",
      "telefonoCliente": "7777-8888",
      "fechaEntrega": "2026-12-31T10:00:00",
      "comentarios": "Entregar por la tarde",
      "items": [{ "productoId": 1, "cantidad": 2 }],
      "codigoCupon": "DULCE10",
      "pago": {
        "numeroTarjeta": "4111111111111111",
        "fechaExpiracion": "12/30",
        "cvv": "123",
        "monto": 10.00
      }
    }
    ```
  - **Respuesta 201 Created**:
    ```json
    {
      "id": 1,
      "numeroOrden": "ORD-ABC123DEF456...",
      "estado": "Pendiente",
      "subtotal": 11.00,
      "descuento": 1.10,
      "total": 9.90,
      "referenciaPago": "SIM-ABC123...",
      "fechaCreacion": "2026-01-15T14:30:00Z"
    }
    ```

---

## 6. Manejo de Imágenes Locales y Aleatorias

1. **Directorio Local de Muestras**:
   - Todas las imágenes de muestra se encuentran en `/public/images/chocolates/`.
   - Se diseñaron creaciones vectoriales de alta definición en SVG:
     - `trufa-maracuya.svg`
     - `trufa-noche-magica.svg`
     - `barra-origen-madagascar.svg`
     - `bombones-oro-artesanal.svg`
     - `chocolate-blanco-vainilla.svg`
     - `praline-avellana-tostada.svg`
     - `caja-degustacion-herencia.svg`
     - `cacao-puro-85.svg`
2. **Selección Aleatoria (`src/services/sampleImages.ts`)**:
   - La función `getRandomSampleImage(seed)` o `resolveProductImage(imagenUrl, id)` selecciona aleatoriamente del catálogo de imágenes locales cuando un producto no cuenta con URL fija, permitiendo que cada producto obtenga una presentación única.
3. **Excepciones Exclusivas de Marca**:
   - **Fondo de inicio (Hero Banner)**: Conserva la imagen original artesanal en `BRAND_ASSETS.heroBanner`.
   - **Nuestra Historia (Cacao Pod)**: Conserva la imagen de cosecha en `BRAND_ASSETS.storyCacaoPod`.
   - Ninguna de estas dos imágenes se aleatoriza, preservando la identidad visual del diseño.

---

## 7. Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia Vite en el puerto 3000. |
| `npm run build` | Compila TypeScript y empaqueta la aplicación de producción en `dist/`. |
| `npm run preview` | Previsualiza la versión compilada de producción en el puerto local. |
| `npm run lint` | Ejecuta la comprobación estricta de tipos de TypeScript (`tsc --noEmit`). |

---

## 8. Solución de Problemas Frecuentes

1. **Error de certificado SSL en Kestrel**:
  - Ejecuta `dotnet dev-certs https --trust`.
2. **Error 409 Conflict al crear pedido o calcular carrito**:
   - El backend de .NET devuelve `409` si el stock es insuficiente o el cupón superó el límite de usos. El frontend maneja este mensaje y permite ajustar las cantidades en el carrito.

---

## 9. Guías y Documentos Complementarios

Para profundizar en aspectos específicos del proyecto, consulta los documentos complementarios con referente a instalación y manuales de usuario.

