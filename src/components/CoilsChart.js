import React, { useEffect } from "react";
import * as d3 from "d3";
import generateBtcPrice from "../util/generateBtcPrice";
const btcPrice = 11434.1;
const generator = generateBtcPrice(btcPrice);

// https://observablehq.com/@dan-goldberg/real-time-targeting-using-social-listening-cost-analysis

const generatePrice = (size) => {
  const data = [];
  for (let i = 0; i < size; i++) {
    data.push(generator.next().value);
  }
  return data;
};

export default function CoilsChart() {
  useEffect(() => {
    const margin = { top: 20, right: 0, bottom: 30, left: 40 };
    const height = 500;
    const width = 500;
    const data = generatePrice(50);
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
    let lastEventTransform = null;

    function zoomed() {
      const event = d3.event;
      const xz = event.transform.rescaleX(x);
      const yz = event.transform.rescaleY(y);
      lastEventTransform = event.transform;
      updateChart(xz, yz);
    }
    const step = width / data.length;
    let stepReducer = step;
    const updateData = () => {
      const { value } = generator.next();
      data.push(value);
      x.domain(d3.extent(data, (d) => d.time)).range([
        margin.left - stepReducer,
        width - margin.right,
      ]);
      const xz = lastEventTransform ? lastEventTransform.rescaleX(x) : x;
      const yz = lastEventTransform ? lastEventTransform.rescaleY(y) : y;
      stepReducer += step;
      lineChart.datum(data);
      updateChart(xz, yz);
      svg.call(
        d3
          .zoom()
          .scaleExtent([1, 8])
          .translateExtent([
            [margin.left - stepReducer, -Infinity],
            [width - margin.right, Infinity],
          ])
          .on("zoom", zoomed)
      );
    };
    const updateChart = (xz, yz) => {
      lineChart.attr(
        "d",
        d3
          .line()
          .x((d) => xz(d.time))
          .y((d) => yz(d.price))
      );
      xAxis.call(
        d3
          .axisBottom(xz)
          .ticks(5)
          .tickSizeOuter(0)
          .tickFormat(d3.timeFormat("%H:%M:%S"))
      );
      yAxis.call(d3.axisLeft(yz));
    };
    setInterval(() => updateData.call(svg.node()), 1000);
  }, []);
  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
