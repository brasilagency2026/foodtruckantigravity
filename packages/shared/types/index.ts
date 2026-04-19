// ============================================
// TYPES COMPARTILHADOS — mobile + web
// ============================================

export type OrderStatus = "recebido" | "preparando" | "pronto" | "entregue" | "cancelado";

export type PaymentStatus = "pendente" | "aprovado" | "recusado" | "reembolsado";

export type PaymentMethod = "pix" | "cartao_credito" | "cartao_debito";

export interface FoodTruck {
  _id: string;
  name: string;
  description: string;
  cuisine: string;
  latitude: number;
  longitude: number;
  address: string;
  isOpen: boolean;
  ownerId: string;
  coverPhotoUrl: string;
  rating?: number;
  totalReviews?: number;
  phone: string;
  openingHours: OpeningHours;
  createdAt: number;
}

export interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;   // "08:00"
  close: string;  // "22:00"
}

export interface MenuItem {
  _id: string;
  truckId: string;
  name: string;
  description: string;
  price: number;         // em centavos (ex: 1990 = R$19,90)
  photoUrl: string;      // Cloudflare R2
  category: string;
  available: boolean;
  preparationTime?: number;
  allergens?: string[];
  sku?: string;
  variations?: { name: string; price: number }[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  observations?: string;
  sku?: string;
  variationName?: string;
}

export interface Order {
  _id: string;
  truckId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  mercadoPagoPaymentId?: string;
  estimatedTime?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Review {
  _id: string;
  truckId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

// ============================================
// UTILS DE FORMATAÇÃO
// ============================================

export const formatPrice = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

export const formatOrderStatus = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    recebido: "✅ Pedido Recebido",
    preparando: "👨‍🍳 Preparando",
    pronto: "🔔 Pronto para Retirada!",
    entregue: "✓ Entregue",
    cancelado: "✗ Cancelado",
  };
  return labels[status];
};
