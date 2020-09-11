import React, { useEffect } from "react";
import * as d3 from "d3";

const ticksNumber = 10;
const URL = "https://cryptobackend.avocadoonline.company";

const getPeriodUtc = () => {
  const endPeriodDate = new Date();
  const startPeriodDate = new Date(endPeriodDate.getTime() - 60 * 1000);
  const endDay = endPeriodDate.getUTCDate();
  const endMonth = endPeriodDate.getUTCMonth() + 1;
  const endYear = endPeriodDate.getUTCFullYear();
  const endHour = endPeriodDate.getUTCHours();
  const endMinute = endPeriodDate.getUTCMinutes();
  const endSecond = endPeriodDate.getUTCSeconds();
  const startDay = startPeriodDate.getUTCDate();
  const startMonth = startPeriodDate.getUTCMonth() + 1;
  const startYear = startPeriodDate.getUTCFullYear();
  const startHour = startPeriodDate.getUTCHours();
  const startMinute = startPeriodDate.getUTCMinutes();
  const startSecond = startPeriodDate.getUTCSeconds();
  return {
    startPeriod: `${startDay}.${startMonth}.${startYear} ${startHour}:${startMinute}:${startSecond}`,
    endPeriod: `${endDay}.${endMonth}.${endYear} ${endHour}:${endMinute}:${endSecond}`,
  };
};
getPeriodUtc();

export default function CoilsChart() {
  const period = getPeriodUtc();
  console.log(period);
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
          .domain([
            d3.min(data, (d) => d.price) - 200,
            d3.max(data, (d) => d.price) + 200,
          ])
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
        const gridY = svg
          .append("g")
          .attr("class", "grid")
          .attr("transform", `translate(0, ${height - margin.bottom})`)
          .call(
            d3
              .axisBottom(x)
              .ticks(ticksNumber)
              .tickFormat(" ")
              .tickSize(margin.top + margin.bottom - height)
          );
        const gridX = svg
          .append("g")
          .attr("class", "grid")
          .call(
            d3.axisLeft(y).ticks(ticksNumber).tickFormat(" ").tickSize(-width)
          );
        const lastPriceGridLine = svg
          .append("g")
          .attr("class", "grid")
          .append("line")
          .attr("x1", x(data[data.length - 1].time))
          .attr("y1", margin.top)
          .attr("x2", x(data[data.length - 1].time))
          .attr("y2", height - margin.bottom);

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
          fetch(`${URL}/core/rateData/getLastBtcPrice?provider=cryptonator`)
            .then((response) => {
              if (!response.ok) throw new Error(response.statusText);
              return response.json();
            })
            .then(({ response }) => ({
              price: response.currentPrice,
              time: new Date(response.timestamp * 1000),
            }))
            .then((value) => {
              console.log(value);
              data.push(value);
              x.domain(d3.extent(data, (d) => d.time)).range([
                margin.left - stepReducer,
                width - margin.right,
              ]);
              const xz = lastEventTransform
                ? lastEventTransform.rescaleX(x)
                : x;
              const yz = lastEventTransform
                ? lastEventTransform.rescaleY(y)
                : y;
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
            });
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
              .ticks(ticksNumber)
              .tickSizeOuter(0)
              .tickFormat(d3.timeFormat("%H:%M:%S"))
          );
          yAxis.call(d3.axisLeft(yz));
          gridY.call(
            d3
              .axisBottom(xz)
              .ticks(ticksNumber)
              .tickFormat(" ")
              .tickSize(margin.top + margin.bottom - height)
          );
          gridX.call(
            d3.axisLeft(yz).ticks(ticksNumber).tickFormat(" ").tickSize(-width)
          );
          lastPriceGridLine
            .attr("x1", xz(data[data.length - 1].time))
            .attr("x2", xz(data[data.length - 1].time));
        };
        setInterval(() => updateData.call(svg.node()), 60 * 1000);
      });
  }, []);
  return <div id="coils-chart" style={{ height: "100vh" }}></div>;
}
