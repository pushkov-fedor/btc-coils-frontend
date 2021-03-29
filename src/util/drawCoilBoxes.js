import * as d3 from "d3";

export const updateCoilBoxes = (
  coilBoxesCoilsArray,
  xScale,
  yScale,
  numberOfCoilBoxes,
  coils,
  completedCoilWidth
) => {
  d3.selectAll(".coil")
    .data(coilBoxesCoilsArray)
    .selectAll(".coil-box")
    .data((coilBoxes, i) => {
      const maxNumberOfPriceItemsInCoilBox = d3.max(
        coilBoxes,
        (coilBox) => coilBox.priceItems.length
      );
      const minPrice = coilBoxes[0].startPrice;
      const maxPrice = coilBoxes[coilBoxes.length - 1].endPrice;
      const priceItemsInCoil = coilBoxes[0].priceItemsInCoil;
      const coilHeight = yScale(minPrice) - yScale(maxPrice);
      const coilBoxHeight = coilHeight / numberOfCoilBoxes;

      const opacityScale = d3
        .scaleLinear()
        .domain([0, maxNumberOfPriceItemsInCoilBox])
        .range([0.2, 1]);
      return coilBoxes.map((coilBox) =>
        Object.assign({}, coilBox, {
          maxNumberOfPriceItemsInCoilBox,
          coilBoxHeight,
          coilIndex: i,
          opacityScale,
          priceItemsInCoil,
        })
      );
    })
    .attr("x", (coilBox) => {
      const { coilIndex, priceItems, maxNumberOfPriceItemsInCoilBox } = coilBox;
      const currentNumberOfPriceItems = coils[coilIndex].length;
      const coilCurrentWidth =
        (completedCoilWidth / coilBox.priceItemsInCoil) *
        currentNumberOfPriceItems;

      const halfBoxWidth = coilCurrentWidth / 2;
      const numberOfPriceItemsInCoilBox = priceItems.length;
      return (
        xScale(coilBox.startTime) +
        (halfBoxWidth -
          (halfBoxWidth * numberOfPriceItemsInCoilBox) /
            maxNumberOfPriceItemsInCoilBox)
      );
    })
    .attr("y", (coilBox) => {
      return yScale(coilBox.endPrice);
    })
    .attr("width", (coilBox) => {
      const { coilIndex, maxNumberOfPriceItemsInCoilBox } = coilBox;
      const currentNumberOfPriceItems = coils[coilIndex].length;
      const coilCurrentWidth =
        (completedCoilWidth / coilBox.priceItemsInCoil) *
        currentNumberOfPriceItems;

      const numberOfPriceItemsInCoilBox = coilBox.priceItems.length;
      return (
        (coilCurrentWidth * numberOfPriceItemsInCoilBox) /
        maxNumberOfPriceItemsInCoilBox
      );
    })
    .attr("height", (coilBox) => {
      const { coilBoxHeight } = coilBox;
      return coilBoxHeight;
    })
    .style("opacity", (coilBox) => {
      const { opacityScale, priceItems } = coilBox;
      const numberOfPriceItemsInCoilBox = priceItems.length;
      return opacityScale(numberOfPriceItemsInCoilBox);
    });
};

export const enterCoilBoxes = (
  coilBoxesCoilsArray,
  xScale,
  yScale,
  numberOfCoilBoxes,
  coils,
  completedCoilWidth
) => {
  d3.selectAll(".coil")
    .data(coilBoxesCoilsArray)
    .selectAll("rect")
    .data((coilBoxes, i) => {
      const maxNumberOfPriceItemsInCoilBox = d3.max(
        coilBoxes,
        (coilBox) => coilBox.priceItems.length
      );
      const minPrice = coilBoxes[0].startPrice;
      const maxPrice = coilBoxes[coilBoxes.length - 1].endPrice;
      const startTime = coilBoxes[0].startTime;
      const priceItemsInCoil = coilBoxes[0].priceItemsInCoil;
      const coilHeight = yScale(minPrice) - yScale(maxPrice);
      const coilBoxHeight = coilHeight / numberOfCoilBoxes;

      const opacityScale = d3
        .scaleLinear()
        .domain([0, maxNumberOfPriceItemsInCoilBox])
        .range([0.2, 1]);

      return coilBoxes.map((coilBox) =>
        Object.assign({}, coilBox, {
          maxNumberOfPriceItemsInCoilBox,
          coilBoxHeight,
          coilIndex: i,
          opacityScale,
          startTime,
          priceItemsInCoil,
        })
      );
    })
    .enter()
    .append("rect")
    .classed("coil-box", true)
    .attr("x", (coilBox) => {
      const { coilIndex, priceItems, maxNumberOfPriceItemsInCoilBox } = coilBox;
      const currentNumberOfPriceItems = coils[coilIndex].length;
      const coilCurrentWidth =
        (completedCoilWidth / coilBox.priceItemsInCoil) *
        currentNumberOfPriceItems;

      const halfBoxWidth = coilCurrentWidth / 2;
      const numberOfPriceItemsInCoilBox = priceItems.length;

      return (
        xScale(coilBox.startTime) +
        (halfBoxWidth -
          (halfBoxWidth * numberOfPriceItemsInCoilBox) /
            maxNumberOfPriceItemsInCoilBox)
      );
    })
    .attr("y", (coilBox) => {
      return yScale(coilBox.endPrice);
    })
    .attr("width", (coilBox) => {
      const { coilIndex, maxNumberOfPriceItemsInCoilBox } = coilBox;
      const currentNumberOfPriceItems = coils[coilIndex].length;
      const coilCurrentWidth =
        (completedCoilWidth / coilBox.priceItemsInCoil) *
        currentNumberOfPriceItems;

      const numberOfPriceItemsInCoilBox = coilBox.priceItems.length;
      return (
        (coilCurrentWidth * numberOfPriceItemsInCoilBox) /
        maxNumberOfPriceItemsInCoilBox
      );
    })
    .attr("height", (coilBox) => {
      const { coilBoxHeight } = coilBox;
      return coilBoxHeight;
    })
    .style("opacity", (coilBox) => {
      const { opacityScale, priceItems } = coilBox;
      const numberOfPriceItemsInCoilBox = priceItems.length;
      return opacityScale(numberOfPriceItemsInCoilBox);
    });
};
