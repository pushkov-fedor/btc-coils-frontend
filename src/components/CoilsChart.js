import React, { useEffect } from "react";
import * as d3 from "d3";

const ticksNumber = 10;
const URL = "https://cryptobackend.avocadoonline.company";

const getPeriodUtc = () => {
  const endPeriodDate = new Date();
  const startPeriodDate = new Date(endPeriodDate.getTime() - 60 * 60 * 1000);
  const endDay = String(endPeriodDate.getUTCDate()).padStart(2, "0");
  const endMonth = String(endPeriodDate.getUTCMonth() + 1).padStart(2, "0");
  const endYear = String(endPeriodDate.getUTCFullYear()).substr(2);
  const endHour = String(endPeriodDate.getUTCHours()).padStart(2, "0");
  const endMinute = String(endPeriodDate.getUTCMinutes()).padStart(2, "0");
  const endSecond = String(endPeriodDate.getUTCSeconds()).padStart(2, "0");
  const startDay = String(startPeriodDate.getUTCDate()).padStart(2, "0");
  const startMonth = String(startPeriodDate.getUTCMonth() + 1).padStart(2, "0");
  const startYear = String(startPeriodDate.getUTCFullYear()).substr(2);
  const startHour = String(startPeriodDate.getUTCHours()).padStart(2, "0");
  const startMinute = String(startPeriodDate.getUTCMinutes()).padStart(2, "0");
  const startSecond = String(startPeriodDate.getUTCSeconds()).padStart(2, "0");
  return {
    startPeriod: `${startDay}.${startMonth}.${startYear} ${startHour}:${startMinute}:${startSecond}`,
    endPeriod: `${endDay}.${endMonth}.${endYear} ${endHour}:${endMinute}:${endSecond}`,
  };
};

export default function CoilsChart() {
  const period = getPeriodUtc();
  useEffect(() => {
    fetch(
      `${URL}/core/rateData/getBtcPriceForPeriod?provider=cryptonator&startPeriod=${period.startPeriod}&endPeriod=${period.endPeriod}`
    )
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
      })
      .then(({ response }) =>
        response.map((row) => ({
          price: row.currentPrice,
          time: new Date(row.timestamp * 1000),
        }))
      )
      .then((data) => {
        const coilBoxes = [];
        const coilsStep = 3;
        for (
          let i = d3.min(data, (d) => d.price);
          i <= d3.max(data, (d) => d.price);
          i += coilsStep
        ) {
          coilBoxes.push({
            startPrice: i,
            coils: [],
          });
        }
        data.forEach((d) => {
          const { price } = d;
          const coilBox = coilBoxes.find(
            (box) =>
              box.startPrice <= price && price < box.startPrice + coilsStep
          );
          coilBox.coils.push(price);
        });

        const margin = { top: 20, right: 0, bottom: 30, left: 40 };
        const height = 1000;
        const width = 1500;
        const svg = d3
          .select("#coils-chart")
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height]);
        const x = d3
          .scaleTime()
          .domain(d3.extent(data, (d) => d.time))
          .range([margin.left, width - margin.right])
          .nice();
        const y = d3
          .scaleLinear()
          .domain([d3.min(data, (d) => d.price), d3.max(data, (d) => d.price)])
          .nice()
          .range([height - margin.bottom, margin.top]);
        const xAxis = svg
          .append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${height - margin.bottom})`)
          .call(
            d3
              .axisBottom(x)
              .ticks(ticksNumber)
              .tickSizeOuter(0)
              .tickFormat(d3.timeFormat("%H:%M:%S"))
          );
        const yAxis = svg
          .append("g")
          .attr("transform", `translate(${margin.left}, 0)`)
          .call(d3.axisLeft(y))
          .call((g) => g.select(".domain").remove());
        const maxCoilsInBox = d3.max(coilBoxes, (box) => box.coils.length);
        svg
          .append("g")
          .attr("transform", `translate(${margin.left},0)`)
          .selectAll("line")
          .data(data)
          .enter()
          .append("line")
          .style("stroke", "blue")
          .attr("x1", (d) => {
            const coilBox = coilBoxes.find(
              (box) =>
                box.startPrice <= d.price &&
                d.price < box.startPrice + coilsStep
            );
            const w = (width * coilBox.coils.length) / maxCoilsInBox;
            return width / 2 - w / 2;
          })
          .attr("y1", (d) => y(d.price))
          .attr("x2", (d) => {
            const coilBox = coilBoxes.find(
              (box) =>
                box.startPrice <= d.price &&
                d.price < box.startPrice + coilsStep
            );
            const w = (width * coilBox.coils.length) / maxCoilsInBox;
            return width / 2 + w / 2;
          })
          .attr("y2", (d) => y(d.price));
        const centerLine = svg
          .append("rect")
          .attr("x", width / 2 - 10 + margin.left)
          .attr("y", margin.top)
          .attr("width", 20)
          .attr("height", height - margin.bottom - margin.top)
          .style("fill", "pink");

        const line = d3
          .line()
          .x((d) => x(d.time))
          .y((d) => y(d.price));

        const lineChart = svg
          .append("path")
          .classed("line", true)
          .datum(data)
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", "green");
      })
      .catch((error) => console.error(error));
  }, []);
  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
