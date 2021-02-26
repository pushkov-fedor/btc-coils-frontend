function* createCoilsGenerator(currentPrice) {
  let time = new Date();
  while (true) {
    yield { price: currentPrice + (Math.random() - 0.5) * 200, time };
    time = new Date(time.getTime() + 1000);
  }
}

export default (currentPrice, numberOfItems) => {
  const data = []
  const generator = createCoilsGenerator(currentPrice)
  for (let i = 0; i < numberOfItems; i++){
    const priceItem = generator.next().value;
    data.push(priceItem)
  }
  return [data, generator]
}