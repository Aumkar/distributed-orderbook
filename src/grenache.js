import { PeerRPCServer, PeerRPCClient } from 'grenache-nodejs-http';
export const createServer = link => {
  const server = new PeerRPCServer(link, {
    timeout: 300000,
  });
  server.init();
  const port = 1024 + Math.floor(Math.random() * 1000);
  const service = server.transport('server');
  service.listen(port);

  return service;
};

export const createClient = (link, serviceName) => {
  const peerClient = new PeerRPCClient(link, {});
  peerClient.init();
  return peerClient;
};
