import React, { useEffect } from "react";
import * as d3 from "d3";
import generateBtcPrice from "../util/generateBtcPrice";
const btcPrice = 11434.1;
const generator = generateBtcPrice(btcPrice);

export default function CoilsChart() {
  useEffect(() => {
    const data = [];
    const width = 500;
    const height = 500;
    let globalX = 0;
    const duration = 500;
    const max = 500;
    const step = 1;
    const chart = d3
      .select("#coils-chart")
      .append("svg")
      .attr("width", width + 50)
      .attr("height", height + 50)
      .style("background", "#f4f4f4")
      .call(
        d3.zoom().on("zoom", function () {
          chart.attr("transform", d3.event.transform);
        })
      )
      .append("g");
    const x = d3.scaleLinear().domain([0, 5000]).range([0, 500]);
    const y = d3
      .scaleLinear()
      .domain([btcPrice - 500, btcPrice + 500])
      .range([500, 0]);

    const line = d3
      .line()
      .x((d) => x(d.time))
      .y((d) => y(d.price));

    const xAxis = d3.axisBottom().scale(x);
    const axisX = chart
      .append("g")
      .attr("transform", "translate(25,500)")
      .call(xAxis);

    const path = chart.append("path");
    const tick = () => {
      const point = generator.next().value;
      data.push(point);
      globalX += step;
      path
        .datum(data)
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "green");
      x.domain([globalX - (max - step), globalX]);
      axisX.transition().duration(duration).ease(d3.easeLinear, 2).call(xAxis);

      path
        .attr("transform", null)
        .transition()
        .duration(duration)
        .ease(d3.easeLinear, 2)
        .attr("transform", "translate(" + x(globalX - max) + ")");
    };
    setInterval(() => tick(), 100);
  }, []);
  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
