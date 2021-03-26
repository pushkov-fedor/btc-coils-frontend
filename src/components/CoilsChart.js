import React, { useEffect } from "react";
import * as d3 from "d3";
import generateBtcPrice from "../util/generateBtcPrice";
import {
  createScaleLinearY,
  createScaleTimeX,
  createAxisLinearY,
  createAxisTimeX,
  drawChart,
  getCoilChunks,
  drawChartArea,
} from "../util/graphics";
import { enterCoils, updateCoils } from "../util/drawCoils";
import { calcilateCoilBoxes } from "../util/calculateCoilBoxes";
import { enterCoilBoxes, updateCoilBoxes } from "../util/drawCoilBoxes";

const currentPrice = 42000;
const numberOfPriceItems = 300;
const numberOfPriceItemsPerCoil = 60;
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

    const axisXLink = svg
      .append("svg")
      .attr("width", width)
      .attr("transform", `translate(${margin}, ${0})`)
      .append("g")
      .attr("transform", `translate(${0}, ${height + 0})`)
      .call(xAxis);
    const axisYLink = svg
      .append("g")
      .attr("transform", `translate(${0}, ${0})`)
      .call(yAxis);

    const chart = drawChart(xScale, yScale, svg, data, margin, height, width);

    const coilsContainer = svg
      .append("svg")
      .classed("coils-container", true)
      .attr("width", width)
      .attr("height", height)
      .attr("transform", `translate(${margin}, ${margin})`)
      .append("g");

    const coils = getCoilChunks(numberOfPriceItemsPerCoil, data);
    const completedCoilWidth =
      (width / numberOfPriceItems) * numberOfPriceItemsPerCoil;
    enterCoils(
      coilsContainer,
      coils,
      completedCoilWidth,
      numberOfUpdates,
      xUpdateStep,
      numberOfPriceItemsPerCoil,
      height
    );

    const numberOfCoilBoxes = 25;
    const coilBoxesCoilsArray = coils.map((priceItemsPerCoil) => {
      const coilBoxes = calcilateCoilBoxes(
        priceItemsPerCoil,
        numberOfCoilBoxes
      );
      return coilBoxes;
    });

    enterCoilBoxes(
      coilBoxesCoilsArray,
      yScale,
      numberOfCoilBoxes,
      coils,
      completedCoilWidth,
      numberOfPriceItemsPerCoil
    );

    const area = drawChartArea(xScale, yScale, data, height);

    const zoom = d3.zoom().on("zoom", zoomed);
    function zoomed() {
      const transform = d3.event.transform;
      chart.attr("transform", transform.toString());
      area.attr("transform", transform.toString());
      coilsContainer.attr("transform", transform.toString());

      const updatedScaleX = transform.rescaleX(xScale);
      xAxis.scale(updatedScaleX);
      axisXLink.call(xAxis);

      const updatedScaleY = transform.rescaleY(yScale);
      yAxis.scale(updatedScaleY);
      axisYLink.call(yAxis);
    }

    const zoomBase = svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mouseover", drawTooltip)
      .on("mousemove", moveTooltip)
      .on("mouseout", removeTooltip);
    zoomBase.call(zoom);

    function drawTooltip() {
      const [mouseX, mouseY] = d3.mouse(this);
      const date = xScale.invert(mouseX);
      const price = yScale.invert(mouseY);
      svg
        .append("line")
        .attr("id", "tooltip-vertical-line")
        .attr("x1", mouseX)
        .attr("x2", mouseX)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "red")
        .attr("stroke-dasharray", 4)
        .style("pointer-events", "none");

      svg
        .append("line")
        .attr("id", "tooltip-horizontal-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", mouseY)
        .attr("y2", mouseY)
        .attr("stroke", "red")
        .attr("stroke-dasharray", 4)
        .style("pointer-events", "none");
    }
    function moveTooltip() {
      const [mouseX, mouseY] = d3.mouse(this);
      const date = xScale.invert(mouseX);
      const price = yScale.invert(mouseY);
      d3.select("#tooltip-vertical-line")
        .attr("x1", mouseX)
        .attr("x2", mouseX)
        .attr("y1", 0)
        .attr("y2", height);
      d3.select("#tooltip-horizontal-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", mouseY)
        .attr("y2", mouseY);
    }
    function removeTooltip() {
      d3.select("#tooltip-vertical-line").remove();
      d3.select("#tooltip-horizontal-line").remove();
    }

    setInterval(() => {
      numberOfUpdates++;
      const newPriceItem = generator.next().value;
      data.push(newPriceItem);

      const xScale = createScaleTimeX(
        data,
        -numberOfUpdates * xUpdateStep,
        width
      );
      const xAxis = createAxisTimeX(xScale);
      axisXLink.call(xAxis);

      const yScale = createScaleLinearY(data, 0, height);
      const yAxis = createAxisLinearY(yScale);
      axisYLink.call(yAxis);

      const area = d3
        .area()
        .x((d) => xScale(d.time))
        .y0(height * 100)
        .y1((d) => yScale(d.price));
      d3.select("#chart-area").datum(data).attr("d", area);

      const line = d3
        .line()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.price));
      d3.select("#line-chart").datum(data).attr("d", line);

      const coils = getCoilChunks(numberOfPriceItemsPerCoil, data);

      enterCoils(
        coilsContainer,
        coils,
        completedCoilWidth,
        numberOfUpdates,
        xUpdateStep,
        numberOfPriceItemsPerCoil,
        height
      );
      updateCoils(
        coilsContainer,
        coils,
        completedCoilWidth,
        numberOfUpdates,
        xUpdateStep,
        numberOfPriceItemsPerCoil
      );
      const coilBoxesCoilsArray = coils
        .map((priceItemsPerCoil) => {
          const coilBoxes = calcilateCoilBoxes(
            priceItemsPerCoil,
            numberOfCoilBoxes
          );
          return coilBoxes;
        })
        .filter((cbc) => cbc.length > 0);

      enterCoilBoxes(
        coilBoxesCoilsArray,
        yScale,
        numberOfCoilBoxes,
        coils,
        completedCoilWidth,
        numberOfPriceItemsPerCoil
      );
      updateCoilBoxes(
        coilBoxesCoilsArray,
        yScale,
        numberOfCoilBoxes,
        coils,
        completedCoilWidth,
        numberOfPriceItemsPerCoil
      );
    }, 500);
  }, []);

  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
