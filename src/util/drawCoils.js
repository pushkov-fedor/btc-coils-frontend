import * as _ from "lodash";

export const enterCoils = (
  coilsContainer,
  coils,
  completedCoilWidth,
  numberOfUpdates,
  xUpdateStep,
  numberOfPriceItemsPerCoil,
  height
) => {
  coilsContainer
    .selectAll("g")
    .data(coils)
    .enter()
    .append("g")
    .classed("coil", true)
    .attr("fill", (d) => {
      const isIncreased = _.last(d).price > _.first(d).price;
      return isIncreased ? "#4DE88C" : "#FA5330";
    })
    .attr("transform", (_, i) => {
      return `translate(${
        i * completedCoilWidth - numberOfUpdates * xUpdateStep
      }, 0)`;
    });
};

export const updateCoils = (
  coilsContainer,
  coils,
  completedCoilWidth,
  numberOfUpdates,
  xUpdateStep,
  numberOfPriceItemsPerCoil
) => {
  coilsContainer
    .selectAll(".coil")
    .data(coils)
    .attr("fill", (d) => {
      const isIncreased = _.last(d).price > _.first(d).price;
      return isIncreased ? "#4DE88C" : "#FA5330";
    })
    .attr("transform", (_, i) => {
      return `translate(${
        i * completedCoilWidth - numberOfUpdates * xUpdateStep
      }, 0)`;
    });
  // .select("rect")
  // .attr("width", (priceItems) => {
  //   const currentNumberOfPriceItems = priceItems.length;
  //   const coilCurrentWidth =
  //     (completedCoilWidth / numberOfPriceItemsPerCoil) *
  //     currentNumberOfPriceItems;
  //   return coilCurrentWidth;
  // });
};
