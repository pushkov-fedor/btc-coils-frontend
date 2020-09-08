import React, { useEffect } from "react";
import * as d3 from "d3";
import generateBtcPrice, { generateSimplyXY } from "../util/generateBtcPrice";
const btcPrice = 11434.1;
const generator = generateBtcPrice(btcPrice);

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
    const data = generateBarChartData(120);

    const svg = d3
      .select("#coils-chart")
      .append("svg")
      .attr("viewBox", [0, 0, width, height]);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));
    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove());

    svg
      .append("g")
      .attr("class", "bars")
      .attr("fill", "green")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.name))
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => y(0) - y(d.value))
      .attr("width", x.bandwidth());

    const extent = [
      [margin.left, margin.top],
      [width - margin.right, height - margin.top],
    ];

    svg.call(
      d3
        .zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed)
    );
    function zoomed() {
      const event = d3.event;
      x.range(
        [margin.left, width - margin.right].map((d) =>
          event.transform.applyX(d)
        )
      );
      svg
        .selectAll(".bars rect")
        .attr("x", (d) => x(d.name))
        .attr("width", x.bandwidth());
      svg.selectAll(".x-axis").call(d3.axisBottom(x).tickSizeOuter(0));
    }
  }, []);
  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
