import React, { useEffect } from "react";
import * as d3 from "d3";
import * as moment from "moment";
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
import {
  drawTooltip as drawTooltipFun,
  moveTooltip as moveTooltipFun,
  removeTooltip as removeTooltipFun,
} from "../util/drawTooltip";
import { addHours, format, fromUnixTime } from "date-fns";
import { BACKEND_URL } from "../constants";
import _ from "lodash";
import isEqual from "date-fns/isEqual";

const endPeriod = new Date();
const startPeriod = addHours(endPeriod, -4);
const provider = "bitstamp";

const formatDate = (date) => {
  return format(date, "dd.MM.yy HH:mm:ss");
};

const parseBackendPriceItem = (priceItem) => ({
  price: priceItem.currentPrice,
  time: fromUnixTime(priceItem.timestamp),
});

const SECOND_PER_COIL = 120;
const TIMEFRAME_IN_SECONDS = 30 * 60;

export default function CoilsChart() {
  useEffect(() => {
    async function initApp() {
      const headers = new Headers();
      headers.append("Accept", "application/json");
      const options = {
        headers,
      };
      const { response } = await fetch(
        `${BACKEND_URL}core/rateData/getBtcPriceForPeriod?` +
          new URLSearchParams({
            provider,
            startPeriod: formatDate(startPeriod),
            endPeriod: formatDate(endPeriod),
          }),
        options
      ).then((r) => r.json());

      if (!response) {
        console.log("Empty response from backend");
        return;
      }

      const data = response
        .map(parseBackendPriceItem)
        .filter(
          (priceItem, i, arr) =>
            i === 0 || !isEqual(priceItem.time, arr[i - 1].time)
        );

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

      let xScale = createScaleTimeX(TIMEFRAME_IN_SECONDS, 0, width);
      const xAxis = createAxisTimeX(xScale);

      let yScale = createScaleLinearY(data, 0, height);
      const yAxis = createAxisLinearY(yScale);

      const chart = drawChart(xScale, yScale, svg, data, margin, height, width);

      const coilsContainer = svg
        .append("svg")
        .classed("coils-container", true)
        .attr("width", width)
        .attr("height", height)
        .attr("transform", `translate(${margin}, ${margin})`)
        .append("g");

      const coils = getCoilChunks(SECOND_PER_COIL, data);
      const completedCoilWidth =
        (width / TIMEFRAME_IN_SECONDS) * SECOND_PER_COIL;
      enterCoils(
        coilsContainer,
        coils,
        completedCoilWidth,
        numberOfUpdates,
        xUpdateStep
      );

      const numberOfCoilBoxes = 25;
      const coilBoxesCoilsArray = coils
        .map((priceItemsPerCoil) => {
          const coilBoxes = calcilateCoilBoxes(
            priceItemsPerCoil,
            numberOfCoilBoxes
          );
          return coilBoxes;
        })
        .filter((coilBox) => coilBox.length > 0);
      console.log("coilBoxesCoilsArray: ", coilBoxesCoilsArray);

      enterCoilBoxes(
        coilBoxesCoilsArray,
        xScale,
        yScale,
        numberOfCoilBoxes,
        coils,
        completedCoilWidth
      );

      const area = drawChartArea(xScale, yScale, data, height);

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

      const zoom = d3.zoom().on("zoom", zoomed);
      let lastTransformEvent;
      function zoomed() {
        const transform = d3.event.transform;
        lastTransformEvent = transform;
        chart.attr("transform", transform.toString());
        area.attr("transform", transform.toString());
        coilsContainer.attr("transform", transform.toString());

        const updatedScaleX = transform.rescaleX(xScale);
        xAxis.scale(updatedScaleX);
        axisXLink.call(xAxis);

        const updatedScaleY = transform.rescaleY(yScale);
        yAxis.scale(updatedScaleY);
        axisYLink.call(yAxis);

        if (lastMouseX && lastMouseY) {
          const [mouseX, mouseY] = [lastMouseX, lastMouseY];
          const date = updatedScaleX.invert(mouseX);
          const price = updatedScaleY.invert(mouseY);
          d3.select("#tooltip-bottom-text").text(
            moment(date).format("HH:mm:ss")
          );
          d3.select("#tooltip-right-text").text(
            Math.round(price)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          );
        }
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

      let lastMouseX, lastMouseY;
      function drawTooltip() {
        const [mouseX, mouseY] = drawTooltipFun.call(
          this,
          xScale,
          yScale,
          svg,
          height,
          width
        );
        lastMouseX = mouseX;
        lastMouseY = mouseY;
      }
      function moveTooltip() {
        const [mouseX, mouseY] = moveTooltipFun.call(
          this,
          lastTransformEvent ? lastTransformEvent.rescaleX(xScale) : xScale,
          lastTransformEvent ? lastTransformEvent.rescaleY(yScale) : yScale
        );
        lastMouseX = mouseX;
        lastMouseY = mouseY;
      }
      function removeTooltip() {
        lastMouseX = lastMouseY = undefined;
        removeTooltipFun();
      }

      setInterval(async () => {
        const { response } = await fetch(
          `${BACKEND_URL}core/rateData/getLastBtcPrice?` +
            new URLSearchParams({
              provider,
            }),
          options
        ).then((r) => r.json());
        const priceItem = parseBackendPriceItem(response);
        console.log("priceItem: ", priceItem);
        if (_.last(data).time.getTime() === priceItem.time.getTime()) {
          return;
        }

        data.push(priceItem);

        xScale = createScaleTimeX(TIMEFRAME_IN_SECONDS, 0, width);
        if (lastTransformEvent) {
          const updatedScaleX = lastTransformEvent.rescaleX(xScale);
          xAxis.scale(updatedScaleX);
        } else {
          xAxis.scale(xScale);
        }
        axisXLink.call(xAxis);

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

        const coils = getCoilChunks(SECOND_PER_COIL, data);

        enterCoils(coilsContainer, coils);
        updateCoils(coilsContainer, coils);
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
          xScale,
          yScale,
          numberOfCoilBoxes,
          coils,
          completedCoilWidth
        );
        updateCoilBoxes(
          coilBoxesCoilsArray,
          xScale,
          yScale,
          numberOfCoilBoxes,
          coils,
          completedCoilWidth
        );

        if (lastMouseX && lastMouseY) {
          const mouseX = lastMouseX;

          const date = lastTransformEvent
            ? lastTransformEvent.rescaleX(xScale).invert(mouseX)
            : xScale.invert(mouseX);
          d3.select("#tooltip-bottom-text").text(
            moment(date).format("HH:mm:ss")
          );
        }
      }, 1000);
    }

    initApp();
  }, []);

  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
