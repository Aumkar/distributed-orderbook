export class Lock {
  constructor() {
    this.clientIds = new Set();
  }

  acquire(clientId) {
    this.clientIds.add(clientId);
  }
  releaes(clientId) {
    this.clientIds.delete(clientId);
  }

  isLocked() {
    return this.clientIds.size > 0;
  }
}
