import React, { useEffect } from "react";
import * as d3 from "d3";
import generateBtcPrice from "../util/generateBtcPrice";
import moment from "moment";
import {
  createScaleLinearY,
  createScaleTimeX,
  createAxisLinearY,
  createAxisTimeX,
  drawChart,
  drawCoil,
  drawCoils,
  getCoilChunks,
  drawCoilD3,
} from "../util/graphics";

const currentPrice = 42000;
const numberOfPriceItems = 1300;
const priceItemsPerCoil = 60;
const [data, generator] = generateBtcPrice(currentPrice, numberOfPriceItems);
export default function CoilsChart() {
  useEffect(() => {
    const margin = 50;
    const width = 1200 - 2 * margin;
    const height = 650 - 2 * margin;
    const xUpdateStep = width / data.length;
    let numberOfUpdates = 0;
    const svg = d3
      .select("#coils-chart")
      .append("svg")
      .attr("width", width + 2 * margin)
      .attr("height", height + 2 * margin)
      .append("g")
      .attr("transform", `translate(${margin}, ${margin})`);

    const xScale = createScaleTimeX(data, 0, width);
    const xAxis = createAxisTimeX(xScale);

    const yScale = createScaleLinearY(data, 0, height);
    const yAxis = createAxisLinearY(yScale);

    const axisLink = svg
      .append("svg")
      .attr("width", width)
      .attr("transform", `translate(${margin}, ${0})`)
      .append("g")
      .attr("transform", `translate(${0}, ${height + 0})`)
      .call(xAxis);
    svg.append("g").attr("transform", `translate(${0}, ${0})`).call(yAxis);

    const lineChart = drawChart(
      xScale,
      yScale,
      svg,
      data,
      margin,
      height,
      width
    );

    const totalPriceItems = data.length;
    let coils = getCoilChunks(priceItemsPerCoil, data).map((coil) =>
      Object.assign(
        {},
        {
          coilWidth: (width / totalPriceItems) * coil.length,
          priceItems: coil,
        }
      )
    );
    const coilsContainer = svg
      .append("svg")
      .classed("coils-container", true)
      .attr("width", width)
      .attr("height", height)
      .attr("transform", `translate(${margin}, ${margin})`);

    d3.select(".coils-container")
      .selectAll("g")
      .data(coils)
      .enter()
      .append("g")
      .attr("transform", (d, i) => {
        const { priceItems } = d;
        const coilWidth = (width / totalPriceItems) * priceItems.length;
        const prevCoilWidth =
          i === 0
            ? coilWidth
            : (width / totalPriceItems) * coils[i - 1].priceItems.length;
        return `translate(${i * prevCoilWidth}, 0)`;
      })
      .classed("coil", true)
      .call(drawCoilD3, yScale);
    // drawCoils(data, width, height, yScale, svg, numberOfUpdates);

    setInterval(() => {
      numberOfUpdates++;
      const newPriceItem = generator.next().value;
      data.push(newPriceItem);
      coils = data.map((coil) =>
        Object.assign(
          {},
          {
            coilWidth: (width / totalPriceItems) * coil.length,
            priceItems: coil,
          }
        )
      );

      const xScale = createScaleTimeX(
        data,
        -numberOfUpdates * xUpdateStep,
        width
      );
      const xAxis = createAxisTimeX(xScale);
      axisLink.call(xAxis);
      const line = d3
        .line()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.price));
      d3.select("#line-chart").datum(data).attr("d", line);
    }, 1000);
  }, []);

  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
