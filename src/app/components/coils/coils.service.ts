import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL } from 'src/app/constants';
import { format } from 'date-fns';
import { PriceItemDto, SpringBackendResponseBase } from './coils.model';

@Injectable()
export class CoilsService {
  constructor(private http: HttpClient) {}

  loadPriceItemsByPeriod(provider: string, startPeriod: Date, endPeriod: Date) {
    return this.http.get<SpringBackendResponseBase<PriceItemDto[] | {}>>(
      `${BACKEND_URL}core/rateData/getBtcPriceForPeriod`,
      {
        params: {
          provider,
          startPeriod: format(startPeriod, 'dd.MM.yy HH:mm:ss'),
          endPeriod: format(endPeriod, 'dd.MM.yy HH:mm:ss'),
        },
      }
    );
  }

  loadLastPriceItem(provider: string) {
    return this.http.get<SpringBackendResponseBase<PriceItemDto> | {}>(
      `${BACKEND_URL}core/rateData/getLastBtcPrice`,
      {
        params: {
          provider,
        },
      }
    );
  }
}
