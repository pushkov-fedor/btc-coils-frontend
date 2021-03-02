import * as d3 from "d3";
import moment from "moment";
import _ from "lodash";

export const createScaleTimeX = (data, startRange, endRange) => {
  return d3
    .scaleTime()
    .domain([d3.min(data, (d) => d.time), d3.max(data, (d) => d.time)])
    .range([startRange, endRange]);
};

export const createScaleLinearY = (data, startRange, endRange) => {
  return d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.price), d3.max(data, (d) => d.price)])
    .range([endRange, startRange]);
};

export const createAxisTimeX = (xScale) => {
  return d3
    .axisBottom()
    .scale(xScale)
    .ticks(d3.timeSecond.every(60))
    .tickFormat((d) => moment(d).format("HH:mm:ss"));
};

export const createAxisLinearY = (yScale) => {
  return d3.axisLeft().scale(yScale);
};

export const drawChart = (xScale, yScale, svg, data, margin, height, width) => {
  const line = d3
    .line()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.price));

  // // points on the graph
  // svg
  //   .append("g")
  //   .selectAll("circle")
  //   .data(data)
  //   .enter()
  //   .append("circle")
  //   .attr("cx", (d) => xScale(d.time))
  //   .attr("cy", (d) => yScale(d.price))
  //   .attr("r", 2)
  //   .attr("fill", "black")
  //   .attr("transform", `translate(${margin}, ${margin})`);

  // // vertical ligns on the points
  // svg
  //   .append("g")
  //   .selectAll("line")
  //   .data(data)
  //   .enter()
  //   .append("line")
  //   .attr("x1", (d) => xScale(d.time))
  //   .attr("y1", 0)
  //   .attr("x2", (d) => xScale(d.time))
  //   .attr("y2", height)
  //   .attr("stroke", "black")
  //   .style("opacity", 0.2)
  //   .attr("transform", `translate(${margin}, ${margin})`);

  return svg
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", `translate(${margin}, ${margin})`)
    .append("path")
    .classed("line", true)
    .datum(data)
    .attr("id", "line-chart")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "green");
};

export const drawCoils = (
  data,
  width,
  height,
  yScale,
  svg,
  numberOfUpdates
) => {
  const secondsPerCoil = 60;
  const totalPriceItems = data.length;
  const coils = _.chunk(data, secondsPerCoil);

  coils.forEach((data, i, arr) => {
    const coilWidth = (width / totalPriceItems) * data.length;
    const prevCoilWidth =
      i === 0 ? coilWidth : (width / totalPriceItems) * arr[i - 1].length;
    drawCoil(
      yScale,
      svg,
      data,
      coilWidth,
      prevCoilWidth,
      height,
      i,
      numberOfUpdates
    );
  });
};

export const drawCoil = (
  yScale,
  svg,
  data,
  width,
  prevWidth,
  height,
  offsetIndex,
  numberOfUpdates
) => {
  const scaler = 5;
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
  data = scaledData;
  const numberOfCoilBoxes = 25;
  const minPrice = d3.min(data, (d) => d.price);
  const maxPrice = d3.max(data, (d) => d.price);
  const coilHeight = yScale(minPrice) - yScale(maxPrice);

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

    // // bottom line based on coilBox START price
    // svg
    //   .append("line")
    //   .attr("x1", offsetIndex * width)
    //   .attr("y1", yScale(i))
    //   .attr("x2", width + offsetIndex * width)
    //   .attr("y2", yScale(i))
    //   .attr("stroke", "purple")
    //   .attr("transform", `translate(${margin}, ${margin})`);

    // // top line based on coilBox END price
    // svg
    //   .append("line")
    //   .attr("x1", offsetIndex * width)
    //   .attr("y1", yScale(i + coilBoxStep))
    //   .attr("x2", width + offsetIndex * width)
    //   .attr("y2", yScale(i + coilBoxStep))
    //   .attr("stroke", "purple")
    //   .attr("transform", `translate(${margin}, ${margin})`);
  }

  // vertixal ligns divide coils
  svg
    .append("g")
    .append("line")
    .attr("x1", (offsetIndex + 1) * prevWidth)
    .attr("y1", 0)
    .attr("x2", (offsetIndex + 1) * prevWidth)
    .attr("y2", height)
    .attr("stroke", "black");
  data.forEach((p) => {
    const coilBox = coilBoxes.find(
      (b, i, arr) =>
        b.startPrice <= p.price &&
        p.price <=
          b.endPrice + (i === arr.length - 1 ? (maxPrice - minPrice) / 100 : 0)
    );
    coilBox.coils.push(p);
  });

  const maxNumberOfPriceItemsInCoilBox = d3.max(
    coilBoxes,
    (d) => d.coils.length
  );

  const opacityScale = d3
    .scaleLinear()
    .domain([0, maxNumberOfPriceItemsInCoilBox])
    .range([0.2, 1]);

  const boxHeight = coilHeight / numberOfCoilBoxes;
  const boxWidth = width;

  return svg
    .append("g")
    .classed("coil", true)
    .selectAll("rect")
    .data(coilBoxes)
    .enter()
    .append("rect")
    .classed("coil-bos", true)
    .attr("x", (coilBox) => {
      const halfBoxWidth = boxWidth / 2;
      const numberOfPriceItemsInCoilBox = coilBox.coils.length;
      return (
        halfBoxWidth -
        (halfBoxWidth * numberOfPriceItemsInCoilBox) /
          maxNumberOfPriceItemsInCoilBox +
        offsetIndex * prevWidth
      );
    })
    .attr("y", (coilBox) => {
      return yScale(coilBox.endPrice);
    })
    .attr("width", (coilBox) => {
      const numberOfPriceItemsInCoilBox = coilBox.coils.length;
      return (
        (boxWidth * numberOfPriceItemsInCoilBox) /
        maxNumberOfPriceItemsInCoilBox
      );
    })
    .attr("height", () => {
      return boxHeight;
    })
    .style("fill", "black")
    .style("opacity", (coilBox) => {
      const numberOfPriceItemsInCoilBox = coilBox.coils.length;
      return opacityScale(numberOfPriceItemsInCoilBox);
    });
};
