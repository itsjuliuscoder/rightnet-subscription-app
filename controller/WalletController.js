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
const Sequelize = require("sequelize");
const { resolveSoa } = require('dns');
const Op = Sequelize.Op;
const SHA256 = require('crypto-js/sha256');
const CryptoJS = require('crypto-js');
const axios = require('axios');

exports.getWalletDetails = (req, res) => {
    
}

exports.getAirtimeBalance = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            statusCode: "012",
            statusMessage: "Validation failed, request body is not valid",
            errors: errors.array()
        });
    }

}

exports.getDataBalance = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            statusCode: "012",
            statusMessage: "Validation failed, request body is not valid",
            errors: errors.array()
        });
    }

}

exports.purchaseAirtime = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            statusCode: "012",
            statusMessage: "Validation failed, request body is not valid",
            errors: errors.array()
        });
    }

    

    const static_number = "2348031011125";
    const beneficiary_number = req.body.msisdn;
    const amount = req.body.amount;
    const transactionId = req.body.transactionId;
    const transactionPin = req.body.transPin;
    const phone_number = req.body.phone_number;
    const user_id = req.body.user_id;
    const walletBalance = req.body.walletBalance;

    const payload = {
        subscriptionId: "1",
        beneficiaryId: beneficiary_number,
        amountCharged: amount,
        subscriptionProviderId: "ERS",
        correlationId: transactionPin
    }

    let bufferObj = Buffer.from(transactionPin, "utf8");

    let hashedPin = bufferObj.toString("base64");

    // const hashedPin = CryptoJS.AES.encrypt(transactionPin, process.env.SECRET_KEY).toString();
    console.log("this is the hashedPin -->", hashedPin);

    Pin.findOne({
        where: { 
            [Op.and]: [{phone_number: phone_number}, {user_id: user_id}, {pin: hashedPin}]
        }
    }).then((resp) => {
        if(resp == null){

            res.status(404).json({
                statusCode: "018",
                statusMessage: "PIN failed",
            });

        } else {
            axios({
                method: 'post',
                headers: {
                    // access_token: access_token,
                    'x-country-code': "NG",
                    'x-api-key': "v0nHtqiYAe2InBmoaMZ2G4DjcRjlcL3V",
                    'Credentials': "ZGlyZWN0Y29ubmVjdHVzZXIwMTpWN3B0SFdOMEs4MXVvbA==",
                    'transactionId': transactionId
                },
                url: `https://preprod-nigeria.api.mtn.com/v2/customers/${static_number}/subscriptions`,
                data: payload
            }).then(function(response){
                if(response.data.statusCode == "0000"){
                    Transaction.findOrCreate({ 
                        where: { 
                            [Op.and]: [{reference_id: transactionId}, {user_id: user_id}, {phone_number: phone_number}]
                        },    
                        defaults: { user_id: user_id, phone_number: phone_number, reference_id: reference_id, fullname: fullname, amount: amount, previous_balance: previous_balance, description: description}
                    }).then(([result, created]) => {
                        if((result != null) && (created == false) ){
                            res.status(302).json({
                                statusCode: "013",
                                statusMessage: "Duplicate Reference ID!"
                            });
                        } 
                        else {
                            res.status(200).json({
                                statusCode: response.data.statusCode,
                                statusMessage: response.data.statusMessage,
                                beneficiaryId: response.data.beneficiaryId,
                                transactionId: response.data.transactionId,
                                subscriptionStatus: response.data.subscriptionStatus
                            }); 
                        }                          
                    }).catch((err) => {
                        res.status(403).json({
                            statusCode: "016",
                            statusMessage: err.message
                        });
                    })
                }
        
                console.log("success response from MTN --> " + JSON.stringify(response.data));
                
            }).catch((error) => {
                res.status(303).json({
                    statusCode: error.response.data.status,
                    statusMessage: error.response.data.message,
                });
                console.log(" Error response for cancel paycode --> " + JSON.stringify(error.response.data));
               
            });
        }
    })
}

exports.purchaseData = (req, res) => {

}

exports.getAllServices = (req, res) => {

}

