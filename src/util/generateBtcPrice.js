function* createCoilsGenerator(currentPrice) {
  let time = new Date();
  time.setMilliseconds(0);
  let iter = 0;
  let prevPrice = currentPrice;
  while (true) {
    const generatedPrice = prevPrice + (Math.random() - 0.5) * 200;
    yield { price: generatedPrice, time };
    time = new Date(time.getTime() + 1000);
    prevPrice = generatedPrice;
  }
}

export default (currentPrice, numberOfItems) => {
  const data = [];
  const generator = createCoilsGenerator(currentPrice);
  for (let i = 0; i < numberOfItems; i++) {
    const priceItem = generator.next().value;
    data.push(priceItem);
  }
  return [
    data.map((priceItem) =>
      Object.assign({}, priceItem, { price: +priceItem.price.toFixed(1) })
    ),
    generator,
  ];
};
