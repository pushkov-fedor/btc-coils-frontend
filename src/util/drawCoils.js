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
    .attr("transform", (_, i) => {
      return `translate(${
        i * completedCoilWidth - numberOfUpdates * xUpdateStep
      }, 0)`;
    });
  // .append("rect")
  // .attr("x", 0)
  // .attr("y", 0)
  // .attr("width", (priceItems) => {
  //   const currentNumberOfPriceItems = priceItems.length;
  //   const coilCurrentWidth =
  //     (completedCoilWidth / numberOfPriceItemsPerCoil) *
  //     currentNumberOfPriceItems;
  //   return coilCurrentWidth;
  // })
  // .attr("height", height)
  // .attr("fill", "none")
  // .style("stroke", "black");
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
