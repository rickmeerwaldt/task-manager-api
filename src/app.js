const express = require('express');
require('./db/mongoose');
const userRoute = require('./routes/user')
const taskRoute = require('./routes/task')

const app = express();

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

// app.listen(PORT, () => {
//   console.log('Server up at port:', PORT)
// })

module.exports = app;
