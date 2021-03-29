import * as d3 from "d3";
import moment from "moment";
import _ from "lodash";
import isEqual from "date-fns/isEqual";
import isBefore from "date-fns/isBefore";
import { addSeconds, isAfter } from "date-fns";
import addMinutes from "date-fns/addMinutes";

export const createScaleTimeX = (timeframeInSeconds, startRange, endRange) => {
  const currentDateEnd = new Date();
  const currentDateStart = addSeconds(
    new Date(currentDateEnd.getTime()),
    -timeframeInSeconds
  );
  return d3
    .scaleTime()
    .domain([currentDateStart, currentDateEnd])
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
    .ticks(10)
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

  return svg
    .append("svg")
    .classed("chart-container", true)
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

export const drawChartArea = (xScale, yScale, data, height) => {
  const area = d3
    .area()
    .x((d) => xScale(d.time))
    .y0(height * 100)
    .y1((d) => yScale(d.price));

  return d3
    .select(".chart-container")
    .append("path")
    .datum(data)
    .attr("class", "area")
    .attr("id", "chart-area")
    .attr("d", area);
};

export const getCoilChunks = (secondsPerCoil, data) => {
  const startTime = _.first(data).time;
  const endTime = _.last(data).time;
  const chunks = [];
  for (
    let timeframeStart = startTime;
    isEqual(timeframeStart, endTime) || isBefore(timeframeStart, endTime);
    timeframeStart = addSeconds(timeframeStart, secondsPerCoil)
  ) {
    const timeframeEnd = addSeconds(
      new Date(timeframeStart.getTime()),
      secondsPerCoil
    );
    const chunk = data.filter(
      (priceItem) =>
        (isEqual(priceItem.time, timeframeStart) ||
          isAfter(priceItem.time, timeframeStart)) &&
        isBefore(priceItem.time, timeframeEnd)
    );
    chunks.push(chunk);
  }
  const lastChunk = _.last(chunks);
  const minChunkSizeExcludedLast = d3.min(
    _.slice(chunks, 0, -1),
    (chunk) => chunk.length
  );
  return lastChunk.length === minChunkSizeExcludedLast
    ? chunks
    : _.slice(chunks, 0, -1);
};

export const drawCoilD3 = (coilsSelection, yScale) => {
  coilsSelection
    .selectAll("rect")
    .data((data, i) => {
      const { priceItems, coilWidth } = data;

      const scaler = 5;
      const scaledData = priceItems
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
      const coilBoxHeight = coilHeight / numberOfCoilBoxes;

      const coilBoxStep = +((maxPrice - minPrice) / numberOfCoilBoxes).toFixed(
        1
      );
      const coilBoxes = [];

      for (
        let i = minPrice;
        i < maxPrice - (maxPrice - minPrice) / 100;
        i = +(i + coilBoxStep).toFixed(1)
      ) {
        coilBoxes.push({
          startPrice: i,
          endPrice: +(i + coilBoxStep).toFixed(1),
          priceItems: [],
          coilWidth,
          coilBoxHeight,
        });
      }

      data.forEach((p) => {
        const coilBox = coilBoxes.find(
          (b, i, arr) =>
            b.startPrice <= p.price &&
            p.price <=
              b.endPrice +
                (i === arr.length - 1 ? (maxPrice - minPrice) / 100 : 0)
        );
        coilBox.priceItems.push(p);
      });
      const maxNumberOfPriceItemsInCoilBox = d3.max(
        coilBoxes,
        (d) => d.priceItems.length
      );
      const opacityScale = d3
        .scaleLinear()
        .domain([0, maxNumberOfPriceItemsInCoilBox])
        .range([0.2, 1]);

      return coilBoxes.map((coilBox) =>
        Object.assign({}, coilBox, {
          maxNumberOfPriceItemsInCoilBox,
          opacityScale,
        })
      );
    })
    .enter()
    .append("rect")
    .classed("coil-box", true)
    .call(drawCoilBox, yScale);
};

const drawCoilBox = (coilBoxSelection, yScale) => {
  coilBoxSelection
    .attr("x", (d) => {
      console.log(d);
      const { coilWidth, priceItems, maxNumberOfPriceItemsInCoilBox } = d;
      const halfBoxWidth = coilWidth / 2;
      const numberOfPriceItemsInCoilBox = priceItems.length;
      return (
        halfBoxWidth -
        (halfBoxWidth * numberOfPriceItemsInCoilBox) /
          maxNumberOfPriceItemsInCoilBox
      );
    })
    .attr("y", (coilBox) => {
      return yScale(coilBox.endPrice);
    })
    .attr("width", (coilBox) => {
      const { coilWidth, maxNumberOfPriceItemsInCoilBox } = coilBox;
      const numberOfPriceItemsInCoilBox = coilBox.priceItems.length;
      return (
        (coilWidth * numberOfPriceItemsInCoilBox) /
        maxNumberOfPriceItemsInCoilBox
      );
    })
    .attr("height", (coilBox) => {
      console.log(coilBox);
      return coilBox.coilBoxHeight;
    })
    .style("fill", "black")
    .style("opacity", (coilBox) => {
      const { opacityScale } = coilBox;
      const numberOfPriceItemsInCoilBox = coilBox.priceItems.length;
      return opacityScale(numberOfPriceItemsInCoilBox);
    });
};
