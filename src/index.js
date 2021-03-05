// importing express app and all required files
const app = require('./app');

// turning on local server
const port = process.env.PORT;
app.listen( port, () => console.log(`Server is up on port ${port}`));