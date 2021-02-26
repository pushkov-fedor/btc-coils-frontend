import * as d3 from "d3";
import moment from "moment";

export const createScaleTimeX = (data, width) => {
  return d3
    .scaleTime()
    .domain([d3.min(data, (d) => d.time), d3.max(data, (d) => d.time)])
    .range([0, width]);
};

export const createScaleLinearY = (data, height) => {
  return d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.price), d3.max(data, (d) => d.price)])
    .range([height, 0]);
};

export const createAxisTimeX = (xScale) => {
  return d3
    .axisBottom()
    .scale(xScale)
    .ticks(10)
    .tickFormat((d) => moment(d).format("HH:MM"));
};

export const createAxisLinearY = (yScale) => {
  return d3.axisLeft().scale(yScale);
};
