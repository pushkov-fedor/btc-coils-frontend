import { isAfter } from "date-fns";
import isBefore from "date-fns/isBefore";
import isEqual from "date-fns/isEqual";

export const priceOwner = {
  data: [],
  fill(data) {
    this.data = data;
  },
  fillBefore(beforeData) {
    this.data = [...beforeData, ...this.data];
  },
  add(dataItem) {
    this.data.push(dataItem);
  },
  getPriceItems() {
    return this.data;
  },
  getDensedPriceItems(transformK) {
    console.log(this.data.length);
    console.log(transformK);
    console.log(this.data.length * transformK);
  },
  getViewportPriceItems(scaleX) {
    const [startTime, endTime] = scaleX.domain();
    const priceItems = this.data.filter(
      ({ time }) =>
        (isEqual(time, startTime) || isAfter(time, startTime)) &&
        (isEqual(time, endTime) || isBefore(time, endTime))
    );
    return priceItems;
  },
};
