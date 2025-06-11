export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  description: string;
  sku: string;
  imageUrl?: string; // Novo campo para a imagem do produto
}

export interface Person {
  id: string;
  name: string;
  contactInfo?: string;
}

export interface OutputLog {
  id: string;
  productId: string;
  productName?: string; // Denormalized for display
  personId: string;
  personName?: string; // Denormalized for display
  quantity: number;
  timestamp: string; // ISO string for date
}

export enum View {
  Products = 'PRODUCTS',
  People = 'PEOPLE',
  RecordOutput = 'RECORD_OUTPUT',
  OutputLog = 'OUTPUT_LOG',
  Dashboard = 'DASHBOARD'
}