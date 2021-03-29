import * as _ from "lodash";

export const enterCoils = (coilsContainer, coils) => {
  coilsContainer
    .selectAll("g")
    .data(coils)
    .enter()
    .append("g")
    .classed("coil", true)
    .attr("fill", (d) => {
      const isIncreased = _.last(d).price > _.first(d).price;
      return isIncreased ? "#26A69A" : "#EF5350";
    });
};

export const updateCoils = (coilsContainer, coils) => {
  coilsContainer
    .selectAll(".coil")
    .data(coils)
    .attr("fill", (d) => {
      const isIncreased = _.last(d).price > _.first(d).price;
      return isIncreased ? "#26A69A" : "#EF5350";
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
