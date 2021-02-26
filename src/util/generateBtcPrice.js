function* createCoilsGenerator(currentPrice) {
  let time = new Date();
  let iter = 0;
  while (true) {
    yield { price: currentPrice + Math.random() * 200, time };
    time = new Date(time.getTime() + 1000);
  }
}

export default (currentPrice, numberOfItems) => {
  const data = [];
  const generator = createCoilsGenerator(currentPrice);
  for (let i = 0; i < numberOfItems; i++) {
    const priceItem = generator.next().value;
    data.push(priceItem);
  }
  return [data, generator];
};
