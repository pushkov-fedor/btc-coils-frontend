import * as d3 from "d3";
import moment from "moment";

export const createScaleTimeX = (data, width) => {
  return d3
    .scaleTime()
    .domain([d3.min(data, (d) => d.time), d3.max(data, (d) => d.time)])
    .range([0, width]);
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
    .ticks(10)
    .tickFormat((d) => moment(d).format("HH:MM"));
};

export const createAxisLinearY = (yScale) => {
  return d3.axisLeft().scale(yScale);
};

export const drawChart = (xScale, yScale, svg, data, margin) => {
  const line = d3
    .line()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.price));

  return svg
    .append("path")
    .classed("line", true)
    .datum(data)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("transform", `translate(${margin}, ${margin})`);
};

export const drawCoils = (xScale, yScale, svg, data, width, margin) => {
  const coilsDiffDivider = 10;
  const minPrice = d3.min(data, (d) => d.price);
  const maxPrice = d3.max(data, (d) => d.price);
  const coilsStep = (maxPrice - minPrice) / coilsDiffDivider;
  const coilBoxes = [];
  for (let i = minPrice; i <= maxPrice; i += coilsStep) {
    coilBoxes.push({
      startPrice: i,
      coils: [],
    });
  }
  data.forEach((p) => {
    const coilBox = coilBoxes.find(
      (b) => b.startPrice <= p.price && p.price < b.startPrice + coilsStep
    );
    coilBox.coils.push(p);
  });
  const maxCoilsInTheBox = d3.max(coilBoxes, (d) => d.coils.length);
  return svg
    .append("g")
    .selectAll("line")
    .data(data)
    .enter()
    .append("line")
    .attr("x1", (d) => {
      const coilBox = coilBoxes.find(
        (b) => b.startPrice <= d.price && d.price < b.startPrice + coilsStep
      );
      const w = (width / maxCoilsInTheBox) * coilBox.coils.length;
      return width / 2 - w / 2;
    })
    .attr("y1", (d) => yScale(d.price))
    .attr("x2", (d) => {
      const coilBox = coilBoxes.find(
        (b) => b.startPrice <= d.price && d.price < b.startPrice + coilsStep
      );
      const w = (width / maxCoilsInTheBox) * coilBox.coils.length;
      return width / 2 + w / 2;
    })
    .attr("y2", (d) => yScale(d.price))
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("stroke", "black")
    .classed("line", true);
};
