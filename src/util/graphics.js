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

  // points on the graph
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

  // vertical ligns on the points
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
    .style("opacity", 0.2)
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
  const coils = _.chunk(data, secondsPerCoil);

  const coilWidth = width / coils.length;

  coils.forEach((data, i) => {
    if (true) {
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
  const numberOfCoilBoxes = 10;
  const minPrice = d3.min(data, (d) => d.price);
  const maxPrice = d3.max(data, (d) => d.price);
  const coilBoxStep = +((maxPrice - minPrice) / numberOfCoilBoxes).toFixed(1);
  const coilBoxes = [];
  for (
    let i = minPrice;
    i < maxPrice - (maxPrice - minPrice) / 100;
    i = +(i + coilBoxStep).toFixed(1)
  ) {
    coilBoxes.push({
      startPrice: i,
      endPrice: +(i + coilBoxStep).toFixed(1),
      coils: [],
    });

    // bottom line based on coilBox START price
    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", yScale(i))
      .attr("x2", width)
      .attr("y2", yScale(i))
      .attr("stroke", "purple")
      .attr("transform", `translate(${margin}, ${margin})`);

    // top line based on coilBox END price
    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", yScale(i + coilBoxStep))
      .attr("x2", width)
      .attr("y2", yScale(i + coilBoxStep))
      .attr("stroke", "purple")
      .attr("transform", `translate(${margin}, ${margin})`);
  }
  // // vertixal ligns divide coils
  // svg
  //   .append("g")
  //   .append("line")
  //   .attr("x1", (offsetIndex + 1) * width)
  //   .attr("y1", 0)
  //   .attr("x2", (offsetIndex + 1) * width)
  //   .attr("y2", height)
  //   .attr("transform", `translate(${margin}, ${margin})`)
  //   .attr("stroke", "black")
  //   .style("opacity", "0.2");
  data.forEach((p) => {
    const coilBox = coilBoxes.find(
      (b, i, arr) =>
        b.startPrice <= p.price &&
        p.price <=
          b.endPrice + (i === arr.length - 1 ? (maxPrice - minPrice) / 100 : 0)
    );
    if (!coilBox) {
      console.log("p: ", p);
      console.log("coilBoxes: ", coilBoxes);
    }
    coilBox.coils.push(p);
  });

  const maxNumberOfPriceItemsInCoilBox = d3.max(
    coilBoxes,
    (d) => d.coils.length
  );

  const boxHeight = height / numberOfCoilBoxes;
  const boxWidth = width;

  console.log("coilBoxes: ", coilBoxes);
  return svg
    .append("g")
    .selectAll("rect")
    .data(coilBoxes)
    .enter()
    .append("rect")
    .attr("x", (coilBox, i) => {
      const halfBoxWidth = boxWidth / 2;
      const numberOfPriceItemsInCoilBox = coilBox.coils.length;
      return (
        halfBoxWidth -
        (halfBoxWidth * numberOfPriceItemsInCoilBox) /
          maxNumberOfPriceItemsInCoilBox
      );
    })
    .attr("y", (coilBox, i) => {
      console.log(coilBox);
      const halfBoxHeight = boxHeight / 2;
      const numberOfPriceItemsInCoilBox = coilBox.coils.length;
      // return yScale(coilBox.endPrice);
      return (
        halfBoxHeight -
        (halfBoxHeight * numberOfPriceItemsInCoilBox) /
          maxNumberOfPriceItemsInCoilBox +
        yScale(coilBox.endPrice)
      );
    })
    .attr("width", (coilBox) => {
      const numberOfPriceItemsInCoilBox = coilBox.coils.length;
      return (
        (boxWidth * numberOfPriceItemsInCoilBox) /
        maxNumberOfPriceItemsInCoilBox
      );
    })
    .attr("height", (coilBox) => {
      const numberOfPriceItemsInCoilBox = coilBox.coils.length;
      return (
        (boxHeight * numberOfPriceItemsInCoilBox) /
        maxNumberOfPriceItemsInCoilBox
      );
    })
    .attr("transform", `translate(${margin}, ${margin})`)
    .style("fill", "black")
    .style("opacity", 0.5);
};
