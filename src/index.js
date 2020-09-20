const express = require('express');
const jwt = require('jsonwebtoken');
require('./db/mongoose');
const userRouter = require('./router/user');
const taskRouter = require('./router/task');

// run express app
const app = express();
const port = process.env.PORT || 3000;

// express middleware 
// app.use((req, res, next) => {
// 	res.status(503).send('The site is under maintenance. \n Please try again soon!');
// });

// enables automatic parsing of an incoming json to an object, so we can easily access it
app.use(express.json());

// incorporate external 2 routers
app.use(userRouter);
app.use(taskRouter);

// turning on local server
app.listen( port, () => {
    console.log(`Server is up on port ${port}`);
});

// const myFunction = async() => {
// 	const token = jwt.sign({ _id: 'abd123' }, 'secret', {expiresIn: '7 days'});
// 	console.log(token);

// 	const data = jwt.verify(token, 'secret');
// 	console.log(data);
// };

// myFunction();