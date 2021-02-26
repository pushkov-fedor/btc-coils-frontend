import React, { useEffect } from "react";
import * as d3 from "d3";
import generateBtcPrice from "../util/generateBtcPrice";
import moment from "moment";
import {
  createScaleLinearY,
  createScaleTimeX,
  createAxisLinearY,
  createAxisTimeX,
} from "../util/graphics";
import { scaleLinear } from "d3";

const currentPrice = 42000;
const [data, generator] = generateBtcPrice(currentPrice, 100);

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

    const xScale = createScaleTimeX(data, width);
    const xAxis = createAxisTimeX(xScale);

    const yScale = createScaleLinearY(data, height);
    const yAxis = createAxisLinearY(yScale);

    svg
      .append("g")
      .attr("transform", `translate(${margin}, ${height + margin})`)
      .call(xAxis);
    svg
      .append("g")
      .attr("transform", `translate(${margin}, ${margin})`)
      .call(yAxis);

    const line = d3
      .line()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.price));

    const lineChart = svg
      .append("path")
      .classed("line", true)
      .datum(data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("transform", `translate(${margin}, ${margin})`);
  }, []);

  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
