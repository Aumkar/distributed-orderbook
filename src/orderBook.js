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
    this.data = [...orders];
  }
  addOrder(order) {
    const index = this.data.findIndex(i => i.id === order.id);
    if (index < 0) {
      this.data.push(order);
      return;
    }
    this.data[index] = {
      ...this.data[index],
      ...order,
    };
  }

  generateOrder() {
    return {
      id: this.data.length + 1,
      itemName: ITEM_NAMES[randomize() % ITEM_NAMES.length],
      quantity: randomize(),
      action: ACTION_NAMES[randomize() % ACTION_NAMES.length],
    };
  }
}
