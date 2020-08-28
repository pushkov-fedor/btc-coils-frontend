export default function* (currentPrice) {
  let step = 1;
  while (true) {
    yield { price: currentPrice + (Math.random() - 0.5) * 200, time: step };
    step++;
  }
}
