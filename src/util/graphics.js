import * as d3 from "d3";
import moment from "moment";
import _ from "lodash";

export const createScaleTimeX = (data, width) => {
  return d3
    .scaleTime()
    .domain([d3.min(data, (d) => d.time), d3.max(data, (d) => d.time)])
    .rangeRound([0, width]);
};

export const createScaleLinearY = (data, height) => {
  return d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.price), d3.max(data, (d) => d.price)])
    .range([height, 0]);
};

export const createAxisTimeX = (xScale) => {
  return d3
    .axisBottom()
    .scale(xScale)
    .ticks(d3.timeSecond.every(1))
    .tickFormat((d) => moment(d).format("HH:mm:ss"));
};

export const createAxisLinearY = (yScale) => {
  return d3.axisLeft().scale(yScale);
};

export const drawChart = (xScale, yScale, svg, data, margin, height) => {
  const line = d3
    .line()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.price));

  // svg
  // .append("g")
  // .selectAll("line")
  // .data(scaledData)
  // .enter()
  // .append("line")

  // svg.selectAll("myCircles")
  //     .data(data)
  //     .enter()
  //     .append("circle")
  //       .attr("fill", "red")
  //       .attr("stroke", "none")
  //       .attr("cx", function(d) { return x(d.date) })
  //       .attr("cy", function(d) { return y(d.value) })
  //       .attr("r", 3)

  svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.time))
    .attr("cy", (d) => yScale(d.price))
    .attr("r", 2)
    .attr("fill", "black")
    .attr("transform", `translate(${margin}, ${margin})`);

  // svg
  // .append("g")
  // .append("line")
  // .attr("x1", (offsetIndex + 1) * width)
  // .attr("y1", 0)
  // .attr("x2", (offsetIndex + 1) * width)
  // .attr("y2", height)
  // .attr("transform", `translate(${margin}, ${margin})`)
  // .attr("stroke", "black")
  // .style("opacity", "0.2");

  svg
    .append("g")
    .selectAll("line")
    .data(data)
    .enter()
    .append("line")
    .attr("x1", (d) => xScale(d.time))
    .attr("y1", 0)
    .attr("x2", (d) => xScale(d.time))
    .attr("y2", height)
    .attr("stroke", "black")
    .attr("transform", `translate(${margin}, ${margin})`);

  return svg
    .append("path")
    .classed("line", true)
    .datum(data)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("transform", `translate(${margin}, ${margin})`);
};

export const drawCoils = (data, width, height, margin, yScale, svg) => {
  const secondsPerCoil = 60;
  const coilBoxesX = [];

  const coilChunks = _.chunk(data, secondsPerCoil);

  const coilWidth = width / coilChunks.length;
  const offset = 0;

  coilChunks.forEach((data, i) => {
    if (data.length === secondsPerCoil) {
      drawCoil(yScale, svg, data, coilWidth, height, i, margin);
    }
  });
};

export const drawCoil = (
  yScale,
  svg,
  data,
  width,
  height,
  offsetIndex,
  margin
) => {
  const scaler = 1;
  console.log("data: ", data);
  const scaledData = data
    .map((d, i, arr) => {
      if (i !== arr.length - 1) {
        const next = arr[i + 1];
        return _.range(
          d.price,
          next.price,
          (next.price - d.price) / scaler
        ).map((d) => ({ price: d }));
      }
      return [];
    })
    .flat();
  console.log("scaledData: ", scaledData);

  const numberOfCoilLevels = 5;
  const minPrice = d3.min(data, (d) => d.price);
  const maxPrice = d3.max(data, (d) => d.price);
  const coilsStep = (maxPrice - minPrice) / numberOfCoilLevels;
  const coilBoxes = [];
  for (let i = minPrice; i <= maxPrice; i += coilsStep) {
    coilBoxes.push({
      startPrice: i,
      endPrice: i + coilsStep,
      coils: [],
    });
  }
  scaledData.forEach((p) => {
    const coilBox = coilBoxes.find(
      (b) => b.startPrice <= p.price && p.price < b.endPrice
    );
    coilBox.coils.push(p);
  });
  console.log("coilBoxes: ", coilBoxes);
  const maxCoilsInTheBox = d3.max(coilBoxes, (d) => d.coils.length);

  svg
    .append("g")
    .append("line")
    .attr("x1", (offsetIndex + 1) * width)
    .attr("y1", 0)
    .attr("x2", (offsetIndex + 1) * width)
    .attr("y2", height)
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("stroke", "black")
    .style("opacity", "0.2");

  return svg
    .append("g")
    .selectAll("line")
    .data(scaledData)
    .enter()
    .append("line")
    .attr("x1", (d) => {
      const coilBox = coilBoxes.find(
        (b) => b.startPrice <= d.price && d.price < b.startPrice + coilsStep
      );
      const w = (width / maxCoilsInTheBox) * coilBox.coils.length;
      return width / 2 - w / 2 + offsetIndex * width;
    })
    .attr("y1", (d) => yScale(d.price))
    .attr("x2", (d) => {
      const coilBox = coilBoxes.find(
        (b) => b.startPrice <= d.price && d.price < b.startPrice + coilsStep
      );
      const w = (width / maxCoilsInTheBox) * coilBox.coils.length;
      return width / 2 + w / 2 + offsetIndex * width;
    })
    .attr("y2", (d) => yScale(d.price))
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("stroke", "black")
    .style("opacity", "0.1")
    .classed("line", true);
};
