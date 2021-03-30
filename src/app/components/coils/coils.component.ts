import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { addHours, addMinutes, fromUnixTime, isEqual } from 'date-fns';
import { PriceItem, PriceItemDto } from './coils.model';
import { CoilsService } from './coils.service';
import { D3Service } from './d3.service';

@Component({
  selector: 'app-coils',
  templateUrl: './coils.component.html',
  styleUrls: ['./coils.component.scss'],
  providers: [CoilsService, D3Service],
})
export class CoilsComponent implements OnInit {
  SECOND_PER_COIL = 60;
  TIMEFRAME_IN_SECONDS = 30 * 60;

  margin = 50;
  width = 1200 - 2 * this.margin;
  height = 650 - 2 * this.margin;

  timezoneOffset = new Date().getTimezoneOffset();
  endPeriod = addMinutes(new Date(), this.timezoneOffset);
  startPeriod = addHours(this.endPeriod, -2);
  provider = 'bitstamp';

  data: PriceItem[] = [];

  svg;

  xScale;
  yScale;
  xAxis;
  yAxis;

  chartLink;
  axisXLink;
  axisYLink;

  constructor(
    private _coilsService: CoilsService,
    private _d3Service: D3Service
  ) {}

  async ngOnInit() {
    const { response } = await this._coilsService
      .loadPriceItemsByPeriod(this.provider, this.startPeriod, this.endPeriod)
      .toPromise();
    if (!response) {
      console.log('Empty response from backend');
      return;
    }

    this.data = response.map(this.priceItemDto2PriceItem);

    this.svg = d3
      .select('#coils')
      .append('svg')
      .attr('width', this.width + 2 * this.margin)
      .attr('height', this.height + 2 * this.margin)
      .append('g')
      .attr('transform', `translate(${this.margin}, ${this.margin})`);

    this.xScale = this._d3Service.createScaleTimeX(
      this.TIMEFRAME_IN_SECONDS,
      0,
      this.width
    );
    this.xAxis = this._d3Service.createAxisTimeX(this.xScale);

    this.yScale = this._d3Service.createScaleLinearY(this.data, 0, this.height);
    this.yAxis = this._d3Service.createAxisLinearY(this.yScale);

    this.chartLink = this.drawChart();

    this.axisXLink = this.drawAxisX();
    this.axisYLink = this.drawAxisY();
  }

  drawAxisX() {
    return this.svg
      .append('svg')
      .attr('width', this.width)
      .attr('transform', `translate(${this.margin}, ${0})`)
      .append('g')
      .attr('transform', `translate(${0}, ${this.height + 0})`)
      .call(this.xAxis);
  }

  drawAxisY() {
    return this.svg
      .append('g')
      .attr('transform', `translate(${0}, ${0})`)
      .call(this.yAxis);
  }

  drawChart() {
    const line = d3
      .line<PriceItem>()
      .x((d) => this.xScale(d.time))
      .y((d) => this.yScale(d.price));

    return this.svg
      .append('svg')
      .classed('chart-container', true)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('transform', `translate(${this.margin}, ${this.margin})`)
      .append('path')
      .classed('line', true)
      .datum(this.data)
      .attr('id', 'line-chart')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'green');
  }

  priceItemDto2PriceItem(priceItemDto: PriceItemDto): PriceItem {
    return {
      price: priceItemDto.currentPrice,
      time: fromUnixTime(priceItemDto.timestamp),
    };
  }
}
