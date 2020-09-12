export default function* (currentPrice) {
  let time = new Date();
  while (true) {
    yield { price: currentPrice + (Math.random() - 0.5) * 200, time };
    time = new Date(time.getTime() + 1000);
  }
}

export function* generateSimplyXY(maxX, maxY) {
  while (true) {
    yield { x: Math.random() * maxX, y: Math.random() * maxY };
  }
}
