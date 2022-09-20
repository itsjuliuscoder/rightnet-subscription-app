/**
 * Project: MTN SUBSCRIPTION API 
 * Author: Julius Olajumoke
 * Email: julius.olajumoke@meekfi.com
 * Version: v1.0.0
 */

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cryptoJS =  require('crypto-js');
const SHA256 = require('crypto-js/sha256');
require('dotenv/config');
const logger = require('./logger');
const moment = require('moment');
const authRoutesHandler = require("./routes/auth");
let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
const User =  require("./model/User");
const Pin = require("./model/Pin");
const Wallet = require("./model/Wallet");
const cors = require("cors"); 

app.use(cors({
    origin: "*"
}));

app.use(bodyParser.json()); 

app.use('/v1/auth', authRoutesHandler);

// User.sync({ force: true });
//Pin.sync({ force: true });

app.get('/', (req, res) => {
    res.send({
        statusCode: 200,
        message: "Welcome to MTN Subscription Service",
        description: "This infrastructure facilitates airtime purchase and top up",
        version: "1.0.0"
    });
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT}.`);
    // logger.info(timestamp + " app is running now at Port: " + process.env.PORT);
});