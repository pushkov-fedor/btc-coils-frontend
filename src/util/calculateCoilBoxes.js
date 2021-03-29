import * as d3 from "d3";
import _ from "lodash";

export const calcilateCoilBoxes = (data, numberOfCoilBoxes) => {
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
  const minPrice = d3.min(scaledData, (d) => d.price);
  const maxPrice = d3.max(scaledData, (d) => d.price);

  const coilBoxStep = +((maxPrice - minPrice) / numberOfCoilBoxes).toFixed(1);
  const coilBoxes = [];

  const startTime = _.first(data).time;
  for (
    let i = minPrice;
    i < maxPrice - (maxPrice - minPrice) / 100;
    i = +(i + coilBoxStep).toFixed(1)
  ) {
    coilBoxes.push({
      startPrice: i,
      endPrice: +(i + coilBoxStep).toFixed(1),
      priceItems: [],
      startTime,
      priceItemsInCoil: data.length,
    });
  }

  scaledData.forEach((p) => {
    const coilBox = coilBoxes.find(
      (b, i, arr) =>
        b.startPrice <= p.price &&
        p.price <=
          b.endPrice + (i === arr.length - 1 ? (maxPrice - minPrice) / 100 : 0)
    );
    coilBox.priceItems.push(p);
  });
  return coilBoxes;
};
