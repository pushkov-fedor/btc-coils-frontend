import * as d3 from 'd3';
import { addSeconds, format } from 'date-fns';
import { PriceItem } from './coils.model';

export class D3Service {
  createScaleTimeX(
    timeframeInSeconds: number,
    startRange: number,
    endRange: number
  ) {
    const currentDateEnd = new Date();
    const currentDateStart = addSeconds(currentDateEnd, -timeframeInSeconds);
    console.log('currentDateStart: ', currentDateStart);
    console.log('currentDateEnd: ', currentDateEnd);
    return d3
      .scaleTime()
      .domain([currentDateStart, currentDateEnd])
      .range([startRange, endRange]);
  }

  createScaleLinearY(data: PriceItem[], startRange: number, endRange: number) {
    return d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.price)!, d3.max(data, (d) => d.price)!])
      .range([endRange, startRange]);
  }

  createAxisTimeX(xScale: d3.AxisScale<Date>) {
    return d3
      .axisBottom(xScale)
      .ticks(10)
      .tickFormat((d) => format(d, 'HH:mm:ss'));
  }

  createAxisLinearY(yScale: d3.AxisScale<number>) {
    return d3.axisLeft(yScale);
  }
}
