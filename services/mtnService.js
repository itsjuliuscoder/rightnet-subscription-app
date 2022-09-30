const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment');
require('dotenv/config');
const crypto = require('crypto');
const User = require("../model/User");
const Pin = require("../model/Pin");
const Transaction = require("../model/Transaction");
const Wallet = require("../model/Wallet");
const Sequelize = require("sequelize");
const { resolveSoa } = require('dns');
const Op = Sequelize.Op;
const SHA256 = require('crypto-js/sha256');
const CryptoJS = require('crypto-js');
const axios = require('axios');

const processAirtimeData = async (data) => {
    let response;

    const mtnConfig = {
        headers: {
            'x-country-code': "NG",
                    'x-api-key': "v0nHtqiYAe2InBmoaMZ2G4DjcRjlcL3V",
                    'Credentials': "ZGlyZWN0Y29ubmVjdHVzZXIwMTpWN3B0SFdOMEs4MXVvbA==",
                    'transactionId': data.correlationId
        }
    }

    try {
        response = await axios.post('https://preprod-nigeria.api.mtn.com/v2/customers/2348031011125/subscriptions', data, mtnConfig);
        console.log("this is my response -->", response);
    } catch(err) {
        console.log("this is the error response -->", err);
    }

    // console.log("this is the response gotten", response.data);

    return response;

}


module.exports = {
    processAirtimeData
};