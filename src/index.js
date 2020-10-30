const express = require('express');
const jwt = require('jsonwebtoken');
require('./db/mongoose');
const userRouter = require('./router/user');
const taskRouter = require('./router/task');

const app = express();

// incorporating all middlewares 
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


// turning on local server
const port = process.env.PORT;
app.listen( port, () => console.log(`Server is up on port ${port}`));