import React, { useEffect } from "react";
import * as d3 from "d3";
import generateBtcPrice, { generateSimplyXY } from "../util/generateBtcPrice";
const btcPrice = 11434.1;
const generator = generateBtcPrice(btcPrice);

const generatePrice = (size) => {
  const data = [];
  for (let i = 0; i < size; i++) {
    data.push(generator.next().value);
  }
  return data;
};

const generateBarChartData = (maxValue) => {
  const data = [];
  let charCode = "A".charCodeAt(0);
  for (let i = 0; i < 26; i++) {
    data.push({
      name: String.fromCharCode(charCode),
      value: Math.random() * maxValue,
    });
    charCode++;
  }
  return data;
};

export default function CoilsChart() {
  useEffect(() => {
    const margin = { top: 20, right: 0, bottom: 30, left: 40 };
    const height = 500;
    const width = 500;
    const data = generatePrice(50);
    console.log(data);
    const svg = d3
      .select("#coils-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.time))
      .range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain([btcPrice - 250, d3.max(data, (d) => d.price)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickSizeOuter(0)
          .tickFormat(d3.timeFormat("%H:%M:%S"))
      );
    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove());

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

    const extent = [
      [margin.left, margin.top],
      [width - margin.right, height - margin.top],
    ];

    svg.call(
      d3
        .zoom()
        .scaleExtent([1, 8])
        .extent([
          [margin.left, 0],
          [width - margin.right, height],
        ])
        .translateExtent([
          [margin.left, -Infinity],
          [width - margin.right, Infinity],
        ])
        .on("zoom", zoomed)
    );
    function zoomed() {
      const event = d3.event;
      const xz = event.transform.rescaleX(x);
      lineChart.attr(
        "d",
        d3
          .line()
          .x((d) => xz(d.time))
          .y((d) => y(d.price))
      );
      xAxis.call(
        d3
          .axisBottom(xz)
          .ticks(5)
          .tickSizeOuter(0)
          .tickFormat(d3.timeFormat("%H:%M:%S"))
      );
    }
  }, []);
  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
