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

const processAirtimeData = async (data) => {
    let respMessage;
    
    console.log("this is the request body -->", data);

    console.log("this is the correlation id -->", data.correlationId);
    
    const mtnConfig = {
        headers: {
            'x-country-code': "NG",
                    'x-api-key': "v0nHtqiYAe2InBmoaMZ2G4DjcRjlcL3V",
                    'Credentials': "ZGlyZWN0Y29ubmVjdHVzZXIwMTpWN3B0SFdOMEs4MXVvbA==",
                    'transactionId': data.correlationId
        }
    }

    

    // const response = await axios.post('https://preprod-nigeria.api.mtn.com/v2/customers/2348031011125/subscriptions', data, mtnConfig);

    // console.log("this is the response gotten", response.data);

    //return response;

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
    const transactionPin = req.body.pin;
    const phone_number = req.body.phone_number;
    const user_id = req.body.user_id;
    const walletBalance = req.body.walletBalance;

    console.log("this is the amount -->", amount);
    console.log("this is the transactionId -->", transactionId);
    console.log("this is phone_number -->", phone_number);
    console.log("this is user_id -->", user_id);


    const body = {
        subscriptionId: "1",
        beneficiaryId: "2349132058219",
        amountCharged: amount,
        subscriptionProviderId: "ERS",
        correlationId: transactionId
    }

    console.log("this is the transaction payload -->", body);

    let bufferObj = Buffer.from(transactionPin, "utf8");

    let hashedPin = bufferObj.toString("base64");

    // const hashedPin = CryptoJS.AES.encrypt(transactionPin, process.env.SECRET_KEY).toString();
    console.log("this is the hashedPin -->", hashedPin);

    const fullname = "User with phone number " + phone_number;

    Pin.findOne({
        where: { 
            [Op.and]: [{phone_number: phone_number}, {user_id: user_id}, {pin: hashedPin}]
        }
    }).then((resp) => {
        if(resp == null){
            console.log("")

            res.status(404).json({
                statusCode: "018",
                statusMessage: "PIN failed",
            });

        } else { 
            axios({
                method: 'post',
                headers: {
                    'x-country-code': "NG",
                            'x-api-key': "v0nHtqiYAe2InBmoaMZ2G4DjcRjlcL3V",
                            'Credentials': "ZGlyZWN0Y29ubmVjdHVzZXIwMTpWN3B0SFdOMEs4MXVvbA==",
                            'transactionId': body.correlationId
                },
                url: 'https://preprod-nigeria.api.mtn.com/v2/customers/2348031011125/subscriptions',
                data: body
            }).then((response) => {
                if(response.data.statusCode == "0000"){
                    Wallet.findOne({
                        where: { 
                            [Op.and]: [{phone_number: phone_number}, {user_id: user_id}, {isActive: 1}]
                        }
                    }).then((result) => {
                        if(result === null){
                            console.log("No wallet");
                        } else {
                            // console.log("wallet found --> ", result);
                            const data = {
                                wallet_balance: parseInt(result.dataValues.balance),
                                bonus_amount: result.dataValues.bonus,
                                firstname: result.dataValues.firstname,
                                lastname: result.dataValues.lastname,
                                email: result.dataValues.email,
                                phone_number: result.dataValues.phone_number,
                                dob: result.dataValues.dob,
                                referral_id: result.dataValues.referral_id,
                                referral_code: result.dataValues.referral_code,
                                acctype: result.dataValues.acctype,
                                isActive: result.dataValues.isActive,
                                isPin: result.dataValues.isPin,
                                _id: result.dataValues.id
                            };
                            const current_balance = data.wallet_balance - parseInt(Math.floor(req.body.amount_charged));
                            console.log("this is the amount to charge", req.body.amount_charged);
                            console.log("this is the previous balance", data.wallet_balance);
                            console.log("this is the current balalnce after transaction", current_balance);

                            Wallet.update(
                                {
                                    balance: current_balance
                                },
                                { 
                                where: { 
                                    user_id: user_id
                                }
                            }).then((result) => {
                                if(result == "null"){
                                    console.log("Something went wrong, wallet update failed");
                                } else {
                                    console.log("update was successful", result);
                                    res.status(200).json({
                                        statusCode: response.data.statusCode,
                                        statusMessage: response.data.statusMessage,
                                        transactionId: response.data.transactionId,
                                        subscriptionStatus: response.data.subscriptionStatus,
                                        walletBalance: current_balance
                                    }); 
                                }
                            })
                        }
                    })
                    // console.log("this is the response data", response.data);
                }               
            }).catch((error) => {
                console.log("this is the error", error.response);
                // return response.data;
            });
        }
    })
}

exports.purchaseData = (req, res) => {
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
    const transactionPin = req.body.pin;
    const phone_number = req.body.phone_number;
    const user_id = req.body.user_id;
    const walletBalance = req.body.walletBalance;

    const payload = {
        subscriptionId: "9",
        beneficiaryId: "2349132058219",
        amountCharged: amount,
        subscriptionProviderId: "ERS",
        correlationId: transactionId
    }

    console.log("this is the transaction payload -->", payload);

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
            console.log("")

            res.status(404).json({
                statusCode: "018",
                statusMessage: "PIN failed",
            });

        } else {
            axios({
                method: 'post',
                headers: {
                    'x-country-code': "NG",
                    'x-api-key': "v0nHtqiYAe2InBmoaMZ2G4DjcRjlcL3V",
                    'Credentials': "ZGlyZWN0Y29ubmVjdHVzZXIwMTpWN3B0SFdOMEs4MXVvbA==",
                    'transactionId': transactionId
                },
                url: `https://preprod-nigeria.api.mtn.com/v2/customers/${static_number}/subscriptions`,
                data: payload
            }).then((response) => {
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
                            const current_balance = walletBalance - parseInt(req.body.amount_charged);
                            Wallet.update(
                                {
                                    balance: current_balance
                                },
                                { 
                                where: { 
                                    user_id: user_id
                                }
                            }).then((result) => {
                                if(result == "null"){
                                    res.status(302).json({
                                        statusCode: "013",
                                        statusMessage: "Something went wrong"
                                    });
                                } else {
                                    // console.log("result here -->", result);
                                    res.status(200).json({
                                        statusCode: "000",
                                        statusMessage: "Wallet Top Successuful!",
                                    })
                                }
                            }).catch((err) => {
                                res.status(403).json({
                                    statusCode: "016",
                                    statusMessage: err.message
                                });
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
                if(error){
                    console.log(" Error response MTN --> " + JSON.stringify(error));
                    res.status(303).json({
                        statusCode: error.response.data.status ? error.response.data.status : "019",
                        statusMessage: error.response.data.message ? error.response.data.message : "An error occured",
                    }); 
                } else {
                    res.status(303).json({
                        statusCode: "019",
                        statusMessage: "An error occured",
                    }); 
                }
            });
        }
    })
}

exports.getAllServices = (req, res) => {
    axios({
        method: 'get',
        headers: {
            'x-api-key': "v0nHtqiYAe2InBmoaMZ2G4DjcRjlcL3V",
        },
        url: `https://preprod-nigeria.api.mtn.com/v3/products?nodeId=EVD`,
    }).then((response) => {
        res.status(200).json({
            statusCode: "000",
            statusMessage: "All Services retrieved successfully",
            data: response.data.data
        });
        console.log("this is the response data", JSON.stringify(response.data));
    }).catch((err) => {
        res.status(400).json({
            statusCode: err.status,
            statusMessage: err.message
        });
        //console.log("this is the response data", err.response.data);
    })
}

exports.testAirtime = (req, res) => {

    const body = {
        subscriptionId: "1",
        beneficiaryId: "2349132058219",
        amountCharged: "20",
        subscriptionProviderId:"ERS",
        correlationId:"124312109983122435"
    }

    axios({
        method: 'post',
        headers: {
            "transactionId": body.correlationId,
            "Credentials": "ZGlyZWN0Y29ubmVjdHVzZXIwMTpWN3B0SFdOMEs4MXVvbA==",
            "x-country-code": "NG",
            "x-api-key": "v0nHtqiYAe2InBmoaMZ2G4DjcRjlcL3V"
        },
        url: 'https://preprod-nigeria.api.mtn.com/v2/customers/2348031011125/subscriptions',
        data: body
    }).then((response) => {
        if(response.data.statusCode == "0000"){
            res.status(200).json({
                statusCode: response.data.statusCode,
                statusMessage: "Successful"
            });
        }

        console.log("success response from MTN --> " + JSON.stringify(response.data));
        
    }).catch((error) => {
        if(error != ""){
            console.log(" Error response MTN --> " + JSON.stringify(error));
            res.status(303).json({
                statusCode: error.response && error.response.data.status ? error.response.data.status : "019",
                statusMessage: error.response.data.message ? error.response.data.message : "An error occured",
            }); 
        } else {
            res.status(303).json({
                statusCode: "019",
                statusMessage: "An error occured",
            }); 
        }
    });
}

