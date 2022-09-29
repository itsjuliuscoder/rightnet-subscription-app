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

    const payload = {
        subscriptionId: "1",
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
                            
                            Wallet.findOne({
                                where: { 
                                    [Op.and]: [{phone_number: phone_number}, {user_id: user_id}, {isActive: 1}]
                                }
                            }).then((result) => {
                                if(resp === null){
                                    res.status(404).json({
                                        statusCode: '015',
                                        statusMessage: 'Unable to fetch wallet details'
                                    });
                                } else {
                                    const data = {
                                        wallet_balance: parseInt(resp.dataValues.balance),
                                        bonus_amount: resp.dataValues.bonus,
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
                                    const current_balance = data.wallet_balance - parseInt(req.body.amount_charged);
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
                                    });
                                }
                            }).catch((err) => {
                                
                            })
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
        console.log("this is the response data", err.response.data);
    })
}

