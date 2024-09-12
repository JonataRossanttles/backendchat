const express = require('express');
const cors = require('cors');
const http = require('http'); // Usar http para criar o servidor
const { Server } = require('socket.io'); // Usar Server do socket.io
const port = 5000;
const app = express();


app.use(cors()); // Configura o CORS para todas as rotas do Express

// Criar servidor HTTP
const server = http.createServer(app);

// Configurar o Socket.IO com CORS
const io = new Server(server, {
  cors: {
    origin: "https://chat-snowy-phi.vercel.app/", // Permitir que o frontend em localhost:3000 acesse o servidor
    methods: ["GET", "POST"] // Métodos HTTP permitidos
  }
});

// Configuração do Socket.IO
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('new_message', (dados) => {
    const mensagem = {
        nome: dados.nome,
        conteudo:dados.msg,
        horario:dados.horario,
        data:dados.data

    }
    fetch('https://chat-acdd0-default-rtdb.firebaseio.com/chat.json',{method:'POST',
        headers:{'Content-Type': 'Application/json'},
    body:JSON.stringify(mensagem)}).
    then(response => {
        if(!response.ok){
        throw new Error('Falha na requisição')
    }else{

      socket.emit('enviada',{confirm:'Mensagem enviada'})
      fetch('https://chat-acdd0-default-rtdb.firebaseio.com/chat.json').
      then(response=>response.json()).
      then(dados=> io.emit('update_message',dados) )
    }
 } ).catch((erro)=>{
    socket.emit('erro',{erro:erro})
 })



  });

  socket.on('init',()=>{
    fetch('https://chat-acdd0-default-rtdb.firebaseio.com/chat.json').
    then(response=>response.json()).
    then(dados=> io.emit('update_message',dados))
  
  })

});


// Iniciar o servidor
server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

