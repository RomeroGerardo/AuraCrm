/**
 * Representa un servicio ofrecido por el negocio
 */
export interface BusinessService {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

/**
 * Datos del perfil extendidos con logo y servicios
 */
export interface BusinessProfile {
  id: string;
  full_name: string | null;
  salon_name: string | null;
  avatar_url: string | null;
  logo_url: string | null;
  services: BusinessService[];
}
