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

let clients = []; 

app.use(express.json());

app.get('/', (req, res) => {
  clients.map(user => user.room).filter((x, i, a) => a.indexOf(x) === i).map(room => io.to(room).emit('update', `Teste geral`))
  
  return res.json({ msg: 'Hello world!'});
});

io.on('connection', (client) => {
  client.on('join', ({ name, room}) => {
    console.log('Entrou: ' + name);
    clients.push({ id: client.id, name, room });
    client.join(room);
    client.broadcast.to(room).emit('update', `Usuário entrou - ${name}`)
  });

  client.on('send', (msg) => {
    const user = clients.find(user => user.id === client.id)
    client.broadcast.to(user.room).emit('chat', user.name, msg);
  });

  client.on('disconnect', () => {
    const user = clients.find(user => user.id === client.id);
    if (user) {
      console.log('Saiu: ' + user.name)
      io.to(user.room).emit('update', `Usuário saiu - ${user.name}`);
    }
    
    clients = clients.filter(user => user.id !== client.id);
  });
})

// server.listen(3334);

server.listen(3333, () => {
  console.log('🚀 Chat - Server started on port 3333');
});