export interface PriceItemDto {
  created: number;
  timestamp: number;
  currentPrice: number;
}

export interface SpringBackendResponseBase<T> {
  response?: T;
}

export interface PriceItem {
  price: number;
  time: Date;
}
