import * as d3 from "d3";
import * as moment from "moment";

export function drawTooltip(xScale, yScale, svg, height, width) {
  const [mouseX, mouseY] = d3.mouse(this);
  const date = xScale.invert(mouseX);
  const price = yScale.invert(mouseY);
  svg
    .append("line")
    .attr("id", "tooltip-vertical-line")
    .attr("x1", mouseX)
    .attr("x2", mouseX)
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "rgba(0, 0, 0, 0.5)")
    .attr("stroke-dasharray", 5)
    .style("pointer-events", "none");
  svg
    .append("rect")
    .attr("id", "tooltip-bottom")
    .attr("x", mouseX - 28)
    .attr("y", height)
    .attr("width", 56)
    .attr("height", 16)
    .style("fill", "black");
  svg
    .append("text")
    .attr("id", "tooltip-bottom-text")
    .attr("x", mouseX - 28 + 5)
    .attr("y", height + 12)
    .style("fill", "white")
    .text(moment(date).format("HH:mm:ss"));

  svg
    .append("line")
    .attr("id", "tooltip-horizontal-line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", mouseY)
    .attr("y2", mouseY)
    .attr("stroke", "rgba(0, 0, 0, 0.5)")
    .attr("stroke-dasharray", 5)
    .style("pointer-events", "none");
  svg
    .append("rect")
    .attr("id", "tooltip-right")
    .attr("x", width)
    .attr("y", mouseY - 8)
    .attr("width", 44)
    .attr("height", 16)
    .style("fill", "black");
  svg
    .append("text")
    .attr("id", "tooltip-right-text")
    .attr("x", width + 5)
    .attr("y", mouseY + 4)
    .style("fill", "white")
    .text(
      Math.round(price)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    );
  return [mouseX, mouseY];
}

export function moveTooltip(xScale, yScale) {
  const [mouseX, mouseY] = d3.mouse(this);
  const date = xScale.invert(mouseX);
  const price = yScale.invert(mouseY);
  d3.select("#tooltip-vertical-line").attr("x1", mouseX).attr("x2", mouseX);
  d3.select("#tooltip-bottom")
    .attr("x", mouseX - 28)
    .style("fill", "black");
  d3.select("#tooltip-bottom-text")
    .attr("x", mouseX - 28 + 5)
    .text(moment(date).format("HH:mm:ss"));

  d3.select("#tooltip-horizontal-line").attr("y1", mouseY).attr("y2", mouseY);
  d3.select("#tooltip-right").attr("y", mouseY - 8);
  d3.select("#tooltip-right-text")
    .attr("y", mouseY + 4)
    .text(
      Math.round(price)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    );
  return [mouseX, mouseY];
}

export const removeTooltip = () => {
  d3.select("#tooltip-vertical-line").remove();
  d3.select("#tooltip-bottom").remove();
  d3.select("#tooltip-bottom-text").remove();
  d3.select("#tooltip-right").remove();
  d3.select("#tooltip-right-text").remove();
  d3.select("#tooltip-horizontal-line").remove();
};
