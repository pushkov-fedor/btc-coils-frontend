import * as _ from "lodash";

export const exitCoils = (coilsContainer, coils) => {
  coilsContainer.selectAll("g").data(coils).exit().remove();
};

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
};
