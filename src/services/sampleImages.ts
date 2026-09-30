/**
 * Catálogo de imágenes de muestra contenidas localmente en el directorio del frontend
 * (/public/images/chocolates/...).
 *
 * Cumple con el requerimiento:
 * "Las imágenes de muestra deberán estar contenidas en un directorio dentro del frontend,
 * elegidas aleatoriamente, con excepción del fondo de inicio y de las de nuestra historia."
 */

export const LOCAL_SAMPLE_IMAGES: string[] = [
  '/images/chocolates/trufa-maracuya.svg',
  '/images/chocolates/trufa-noche-magica.svg',
  '/images/chocolates/barra-origen-madagascar.svg',
  '/images/chocolates/bombones-oro-artesanal.svg',
  '/images/chocolates/chocolate-blanco-vainilla.svg',
  '/images/chocolates/praline-avellana-tostada.svg',
  '/images/chocolates/caja-degustacion-herencia.svg',
  '/images/chocolates/cacao-puro-85.svg',
];

/**
 * Retorna una imagen aleatoria del directorio local de muestras.
 * Si se pasa una semilla (ID del producto o texto), calcula un índice determinista
 * para que el producto mantenga su misma imagen durante la sesión, pero seleccionada
 * del catálogo aleatorio local.
 */
export function getRandomSampleImage(seed?: number | string): string {
  if (seed !== undefined && seed !== null) {
    let hash = 0;
    const str = String(seed);
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % LOCAL_SAMPLE_IMAGES.length;
    return LOCAL_SAMPLE_IMAGES[index];
  }

  const randomIndex = Math.floor(Math.random() * LOCAL_SAMPLE_IMAGES.length);
  return LOCAL_SAMPLE_IMAGES[randomIndex];
}

/**
 * Resuelve la imagen de un producto. Si el backend entrega una ruta existente,
 * la normaliza. Si viene vacía o es una imagen genérica, selecciona una del directorio
 * local de muestra.
 */
export function resolveProductImage(
  imagenUrl?: string | null,
  seed?: number | string
): string {
  if (imagenUrl && imagenUrl.trim()) {
    const trimmed = imagenUrl.trim();
    // Si viene la ruta del ejemplo del documento .NET (/images/trufa_maracuya.jpg)
    if (trimmed.includes('trufa_maracuya') || trimmed.includes('trufa-maracuya')) {
      return '/images/chocolates/trufa-maracuya.svg';
    }
    // Si es una ruta que ya existe o una URL válida en la nube
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/images/chocolates/')) {
      return trimmed;
    }
  }

  // De lo contrario, asignar aleatoriamente desde el directorio local de muestras
  return getRandomSampleImage(seed);
}
