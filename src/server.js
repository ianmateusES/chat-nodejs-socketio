import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as Socket } from 'socket.io';

const app = express();
app.use(cors());

const server = createServer(app);

const io = new Socket(server, {
  cors: {
    origin: '*',
  }
});

const clients = {}; 

app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ msg: 'Hello world!'});
});

io.on('connection', (client) => {
  client.on('join', (name) => {
    console.log('Joined: ' + name);
    clients[client.id] = name;
    client.emit('update', 'You have connected to the server.');
    client.broadcast.emit('update', name + ' has joined the server.')
  });

  client.on('send', (msg) => {
    console.log('Message: ' + msg);
    client.broadcast.emit('chat', clients[client.id], msg);
  });

  client.on('disconnect', () => {
    console.log('Disconnect');
    io.emit('update', clients[client.id] + ' has left the server.');
    delete clients[client.id];
  });
})

server.listen(3334);

app.listen(3333, () => {
  console.log('🚀 Chat - Server started on port 3333');
});