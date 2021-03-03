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

    drawChart(xScale, yScale, svg, data, margin, height, width);

    const coilsContainer = svg
      .append("svg")
      .classed("coils-container", true)
      .attr("width", width)
      .attr("height", height)
      .attr("transform", `translate(${margin}, ${margin})`);

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

    // const totalPriceItems = data.length;
    // let coils = getCoilChunks(priceItemsPerCoil, data).map((coil) =>
    //   Object.assign(
    //     {},
    //     {
    //       coilWidth: 220,
    //       priceItems: coil,
    //     }
    //   )
    // );

    // d3.select(".coils-container")
    //   .selectAll("g")
    //   .data(coils)
    //   .enter()
    //   .append("g")
    //   .attr("transform", (d, i) => {
    //     const { priceItems } = d;
    //     const coilWidth = (width / totalPriceItems) * priceItems.length;
    //     const prevCoilWidth =
    //       i === 0
    //         ? coilWidth
    //         : (width / totalPriceItems) * coils[i - 1].priceItems.length;
    //     return `translate(${i * prevCoilWidth}, 0)`;
    //   })
    //   .classed("coil", true)
    //   .call(drawCoilD3, yScale);

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

      const line = d3
        .line()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.price));
      d3.select("#line-chart").datum(data).attr("d", line);

      const coils = getCoilChunks(numberOfPriceItemsPerCoil, data);
      // console.log(coils);
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
      console.log(numberOfUpdates);
    }, 5);
  }, []);

  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
