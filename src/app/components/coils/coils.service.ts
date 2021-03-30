import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL } from 'src/app/constants';
import { addSeconds, format, isAfter, isBefore, isEqual } from 'date-fns';
import {
  PriceItem,
  PriceItemDto,
  SpringBackendResponseBase,
} from './coils.model';
import { Observable } from 'rxjs';
import _ from 'lodash';
import * as d3 from 'd3';

@Injectable()
export class CoilsService {
  constructor(private http: HttpClient) {}

  loadPriceItemsByPeriod(
    provider: string,
    startPeriod: Date,
    endPeriod: Date
  ): Observable<SpringBackendResponseBase<PriceItemDto[]>> {
    return this.http.get<SpringBackendResponseBase<PriceItemDto[]> | {}>(
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

  getCoilChunks(secondsPerCoil: number, data: PriceItem[]) {
    const startTime = _.first(data).time;
    const endTime = _.last(data).time;
    const chunks: PriceItem[][] = [];
    for (
      let timeframeStart = startTime;
      isEqual(timeframeStart, endTime) || isBefore(timeframeStart, endTime);
      timeframeStart = addSeconds(timeframeStart, secondsPerCoil)
    ) {
      const timeframeEnd = addSeconds(
        new Date(timeframeStart.getTime()),
        secondsPerCoil
      );
      const chunk: PriceItem[] = data.filter(
        (priceItem) =>
          (isEqual(priceItem.time, timeframeStart) ||
            isAfter(priceItem.time, timeframeStart)) &&
          isBefore(priceItem.time, timeframeEnd)
      );
      chunks.push(chunk);
    }
    const lastChunk = _.last(chunks);
    const minChunkSizeExcludedLast = d3.min(
      _.slice(chunks, 0, -1),
      (chunk: PriceItem[]) => chunk.length
    );

    return lastChunk.length === minChunkSizeExcludedLast
      ? chunks
      : _.slice(chunks, 0, -1);
  }
}
