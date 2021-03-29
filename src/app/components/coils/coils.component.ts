import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { fromUnixTime } from 'date-fns';
import { PriceItem, PriceItemDto } from './coils.model';
import { CoilsService } from './coils.service';

@Component({
  selector: 'app-coils',
  templateUrl: './coils.component.html',
  styleUrls: ['./coils.component.scss'],
  providers: [CoilsService],
})
export class CoilsComponent implements OnInit {
  SECOND_PER_COIL = 60;
  TIMEFRAME_IN_SECONDS = 30 * 60;

  margin = 50;
  width = 1200 - 2 * this.margin;
  height = 650 - 2 * this.margin;

  svg;

  constructor(private _coilsService: CoilsService) {}

  ngOnInit(): void {
    this.svg = d3
      .select('#coils')
      .append('svg')
      .attr('width', this.width + 2 * this.margin)
      .attr('height', this.height + 2 * this.margin)
      .append('g')
      .attr('transform', `translate(${this.margin}, ${this.margin})`);
  }

  priceItemDto2PriceItem(priceItemDto: PriceItemDto): PriceItem {
    return {
      price: priceItemDto.currentPrice,
      time: fromUnixTime(priceItemDto.timestamp),
    };
  }
}
