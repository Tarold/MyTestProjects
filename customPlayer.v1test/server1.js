const WebSocketServer = require('websocket').server;
const http = require('http');

const server = http.createServer((request, response) => {
  console.log(new Date() + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(3000, () => {
  console.log(new Date() + ' Server is listening on port 3000');
});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

function originIsAllowed(origin) {
  return true;
}

const serverFunnelId = 'main_server_lol';
const conections = [];
const firstRoom = {
  userStatus: {},
  status: { url: '', second: '0', actionTime: '0', playerStatus: 'INIT' },
};

wsServer.on('request', (request) => {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log(
      new Date() + ' Connection from origin ' + request.origin + ' rejected.'
    );
    return;
  }

  const connection = request.accept(null, request.origin);
  conections.push(connection);
  console.log(new Date() + ' Connection accepted.');

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const msgContent = JSON.parse(message.utf8Data);
      console.log('Received Message: ' + message.utf8Data);

      if (msgContent.action === 'register' && msgContent.funnelId) {
        firstRoom.userStatus[msgContent.funnelId] = { connection };
      }
      if (
        msgContent.action === 'set-status' &&
        msgContent.funnelId &&
        msgContent.status
      ) {
        firstRoom.userStatus[msgContent.funnelId] = {
          ...firstRoom.userStatus[msgContent.funnelId],
          status: msgContent.status,
        };
        firstRoom.status = msgContent.status;
      }

      conections.forEach((connectionItem) => {
        if (connection === connectionItem) {
          if (msgContent.action === 'register') {
            connectionItem.sendUTF(
              JSON.stringify({
                action: 'register-succed',
                status: firstRoom.status,
                funnelId: serverFunnelId,
              })
            );
          }
        } else {
          if (msgContent.action === 'set-status') {
            connectionItem.sendUTF(
              JSON.stringify({
                action: 'sync',
                status: firstRoom.status,
                funnelId: serverFunnelId,
              })
            );
          }
        }
      });
    } else if (message.type === 'binary') {
      console.log(
        'Received Binary Message of ' + message.binaryData.length + ' bytes'
      );
      connection.sendBytes(message.binaryData);
    }
  });

  // Обробка закриття з'єднання
  connection.on('close', (reasonCode, description) => {
    console.log(
      new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.'
    );
  });
});
