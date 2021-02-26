import React, { useEffect } from "react";
import * as d3 from "d3";
import generateBtcPrice from "../util/generateBtcPrice";
import moment from "moment";

const currentPrice = 42000;
const [data, generator] = generateBtcPrice(currentPrice, 1000);

export default function CoilsChart() {
  useEffect(() => {
    const margin = 50;
    const width = 1200 - 2 * margin;
    const height = 650 - 2 * margin;

    const svg = d3
      .select("#coils-chart")
      .append("svg")
      .attr("width", width + 2 * margin)
      .attr("height", height + 2 * margin);

    const xScale = d3
      .scaleTime()
      .domain([d3.min(data, (d) => d.time), d3.max(data, (d) => d.time)])
      .range([0, width]);
    const xAxis = d3
      .axisBottom()
      .scale(xScale)
      .ticks(10)
      .tickFormat((d) => moment(d).format("HH:MM"));

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.price), d3.max(data, (d) => d.price)])
      .range([height, 0]);
    const yAxis = d3.axisLeft().scale(yScale);

    svg
      .append("g")
      .attr("transform", `translate(${margin}, ${height + margin})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", `translate(${margin}, ${margin})`)
      .call(yAxis);
  }, []);

  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
