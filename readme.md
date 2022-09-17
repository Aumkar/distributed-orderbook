# Distributed orderbook using [Grenache](https://github.com/bitfinexcom/grenache-grape)

## Problem statement:

- Each client will have its own instance of the orderbook.
- Clients submit orders to their own instance of orderbook. The order is distributed to other instances, too.
- If a client's order matches with another order, any remainer is added to the orderbook, too.

## Installation

- Install dependencies

```
yarn install
```

- Setting up the DHT

```
npm i -g grenache-grape

# boot two grape servers

grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

- Startup multiple clients (these clients auto create order book records)

```
yarn run client
yarn run client
yarn run client
```

## Implementation:

- Each client has its own PeerClient and PeerServer.
- So each client also add new data and listens for changes made by other client.
- Whenever any client wants to add new record:
  - It tries to acquire lock
  - Once aquired it generates order body and broadcasts it to all connected clients.
  - Each client (include creator of order) receives broadcasted order and update own order book instance for the same.
- When new client is added to the network, it tries to sync existing order book from existing client.

## Limitation/Issues:

- Locking mechanism is not very reliable atm. There are some issues when doing initial sync for new client added.
- Adding entries from multiple clients simultaneously end up having inonsistencies some times.
- Code from client.js could be further refactored.
- console.log should be replaced with debug/info logs.
