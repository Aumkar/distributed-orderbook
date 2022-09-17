'use strict';

import Link from 'grenache-nodejs-link';
import { setTimeout } from 'timers/promises';
import { createServer, createClient } from './grenache.js';
import { Lock } from './lock.js';
import { OrderBook } from './orderBook.js';

const ServiceNames = {
  newOrder: 'new-order',
  syncOrders: 'sync-orders',
  lock: 'lock',
  unlock: 'unlock',
};
const lock = new Lock();

const orderBook = new OrderBook();
/**
 * Setting up server
 */
const link = new Link({
  grape: 'http://127.0.0.1:30001',
});
link.start();
const server = createServer(link);

/**
 * Setting up client
 */
const client = createClient(link);

server.on('request', (rid, key, payload, handler) => {
  switch (key) {
    case ServiceNames.newOrder:
      orderBook.addOrder({ ...payload });
      console.log('\nNEW ORDER ADDED !');
      console.log('CURRENT ORDER BOOK:', orderBook.getData());
      console.log('=================================');
      handler.reply(null, { success: true });
      break;
    case ServiceNames.syncOrders:
      handler.reply(null, orderBook.getData());
      break;
    case ServiceNames.lock:
      lock.acquire(payload);
      handler.reply(null, { success: true });
      break;
    case ServiceNames.unlock:
      lock.releaes(payload);
      handler.reply(null, { success: true });
      break;
  }
});

// Starting server listening on multiple services
link.announce(ServiceNames.newOrder, server.port, {});
link.announce(ServiceNames.lock, server.port, {});
link.announce(ServiceNames.unlock, server.port, {});

console.log('Setting up server...');
await setTimeout(500);

const handleError = err => {
  if (err && err.message !== 'ERR_GRAPE_LOOKUP_EMPTY') {
    console.error(err);
    process.exit(-1);
  }
};
const aquireLock = async () => {
  await new Promise(resolve => {
    client.map(
      ServiceNames.lock,
      server.port,
      { timeout: 10000 },
      (err, data) => {
        handleError(err);
        resolve();
      }
    );
  });
};
const releaseLock = async () => {
  await new Promise(resolve => {
    client.map(
      ServiceNames.unlock,
      server.port,
      { timeout: 10000 },
      (err, data) => {
        handleError(err);
        resolve();
      }
    );
  });
};
const syncOrders = async () => {
  while (lock.isLocked()) {
    await setTimeout(200);
  }

  await aquireLock();
  await new Promise(resolve => {
    client.request(
      ServiceNames.syncOrders,
      {},
      { timeout: 10000 },
      (err, data) => {
        handleError(err);
        // Considering only first peer's orders for initial sync
        const initialData = data || [];
        orderBook.setData(initialData);
        console.log('INITIAL STATE SET TO: ', initialData);
        console.log('=================================');
        resolve();
        // inputOrder();
      }
    );
  });
  await releaseLock();
};
const addNewOrder = async () => {
  while (lock.isLocked()) {
    await setTimeout(200);
  }
  await aquireLock();
  const newOrder = orderBook.generateOrder();
  await new Promise(resolve => {
    client.map(
      ServiceNames.newOrder,
      newOrder,
      { timeout: 10000 },
      (err, data) => {
        handleError(err);
        resolve();
      }
    );
  });
  await releaseLock();
};

/**
 * Setting up orders for new client
 */
await syncOrders();

link.announce(ServiceNames.syncOrders, server.port, {});

process.on('SIGINT', () => {
  link.stopAnnouncing(ServiceNames.syncOrders, server.port);
  link.stopAnnouncing(ServiceNames.newOrder, server.port);
  link.stopAnnouncing(ServiceNames.lock, server.port);
  link.stopAnnouncing(ServiceNames.unlock, server.port);
  process.exit(0);
});

while (true) {
  await setTimeout(3000);
  await addNewOrder();
}
