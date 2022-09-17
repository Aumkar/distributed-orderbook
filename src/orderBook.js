const ITEM_NAMES = [
  'Laptop',
  'USB',
  'Webcam',
  'Mobile',
  'Earphone',
  'Headphone',
];
const ACTION_NAMES = ['sell', 'buy'];
const randomize = () => Math.floor(Math.random() * 100);

export class OrderBook {
  constructor() {
    this.data = [];
  }

  getData() {
    return this.data;
  }
  setData(orders) {
    this.data = orders;
  }
  addOrder(order) {
    this.data.push(order);
  }

  generateOrder() {
    return {
      itemName: ITEM_NAMES[randomize() % ITEM_NAMES.length],
      quantity: randomize(),
      action: ACTION_NAMES[randomize() % ACTION_NAMES.length],
    };
  }
}
