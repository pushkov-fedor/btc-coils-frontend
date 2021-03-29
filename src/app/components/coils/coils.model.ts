export interface PriceItemsDto {
  created: number;
  timestamp: number;
  currentPrice: number;
}

export interface SpringBackendResponseBase<T> {
  response: T;
}
