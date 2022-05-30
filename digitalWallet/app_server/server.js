require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const index = require('./routes/index');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
      console.log('DB Connected');
    }).catch((err) => {
      console.log(err);
    });

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '200mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

app.use(cors({ origin: "*" }));

app.use("/wallet", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});

app.use('/wallet', index);

app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});