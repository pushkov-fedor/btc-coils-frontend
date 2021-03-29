import { Component, OnInit } from '@angular/core';
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

  constructor() {}

  ngOnInit(): void {}
}
