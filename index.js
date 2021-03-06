const express = require('express');
const mongoose = require('mongoose');
const Comment = require('./Comment');
const cors = require('cors');
const http = require('http');
const socket = require('socket.io');

const app = express();
const server = http.Server(app);
const comments = express.Router();
const options={
  cors:true,
  origins:["http://127.0.0.1:3000"],
 }

app.use(express.json())
app.use(cors())
app.use('/comments', comments)

const io = socket(server, options);

mongoose.connect('mongodb://localhost/comment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
  })
  .then( () => {
  console.log('sucessfully connect to database'); 
  })
  .catch(err => console.log(err));

io.on('connection', socket => {
  socket.on('create-new-comment', async data => {
    const newComment = Comment(data);
    newComment.save()

    const comments = await Comment.find();
    io.emit('display-latest-comment', comments);    
  })

  socket.on('delete-comment', async id => {
    await Comment.deleteOne({_id: id})

    const comments = await Comment.find();
    io.emit('display-latest-comment', comments);  
  })
})

comments.get('/', (req, res) => {
  Comment.find().then(result => res.send(result))
})

server.listen(3001, () => console.log('Listening in PORT 3001'));
