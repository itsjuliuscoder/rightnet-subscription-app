const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment');
require('dotenv/config');
const crypto = require('crypto');
const User = require("../model/User");
const Wallet = require("../model/Wallet");
const Transaction = require("../model/Transaction");
const Pin = require("../model/Pin");
const Sequelize = require("sequelize");
const { resolveSoa } = require('dns');
const Op = Sequelize.Op;
const SHA256 = require('crypto-js/sha256');
const CryptoJS = require('crypto-js');


exports.loginUser = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            statusCode: "012",
            statusMessage: "Validation failed, request body is not valid",
            errors: errors.array()
        });
    }

    // console.log("this is the login details", req.body);

    const phone_number = req.body.phone_number;
    const password = req.body.password;
    const hashedPassword = password;

    User.findOne({
        where: { 
            [Op.and]: [{phone_number: phone_number}, {password: hashedPassword}, {isActive: 1}]
        }
    }).then((result) => {
        if(result === null){
            res.status(404).json({
                statusCode: '015',
                statusMessage: 'Invalid Login Credentials!'
            });
        } else {
            // console.log("this is the result --> ", result.dataValues);
            const token = jwt.sign({
                username: phone_number,
                password: password,
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: '2h' }
            );

            Wallet.findOne({
                where: { 
                    [Op.and]: [{phone_number: phone_number}, {user_id: result.dataValues.id}, {isActive: 1}]
                }
            }).then((resp) => {
                if(resp === null){
                    res.status(404).json({
                        statusCode: '015',
                        statusMessage: 'Unable to fetch wallet details'
                    });
                } else {
                    const data = {
                        wallet_balance: parseInt(resp.dataValues.balance),
                        bonus_amount: parseInt(resp.dataValues.bonus),
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
    
                    res.status(200).json({
                        statusCode: "000",
                        statusMessage: "Login successful",
                        payload: data,
                        accessToken: token
                    });
                }
            
            }).catch((err) => {

            });
        }
    }).catch((err) => {
        res.status(403).json({
            statusCode: "016",
            statusMessage: err.message
        });
    })
}

exports.registerUser = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            statusCode: "012",
            statusMessage: "Validation failed, request body is not valid",
            errors: errors.array()
        });
    }

    const phone_number = req.body.phone_number;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const fullname = firstname + " " + lastname;
    const dob = req.body.dob;
    const email = req.body.email ? req.body.email : "";
    const referral = req.body.referral_code ? req.body.referral_code : "";
    const acctype = req.body.acctype;
    const password = req.body.password;
    const hashedPassword = password;

    const code = generateRandomString(8);

    User.findOrCreate({ 
        where: { 
            [Op.or]: [{phone_number: phone_number}, {email: email}]
        },    
        defaults: { firstname: firstname, lastname: lastname, email: email, dob: dob, referral_id: referral, referral_code: phone_number, password: hashedPassword, phone_number: phone_number, isActive: 1, isPin: 0, acctype: acctype}
        }).then(([result, created]) => {
            if((result != null) && (created == false) ){
                res.status(302).json({
                    statusCode: "013",
                    statusMessage: "Phone Number & Email Address Already Exists!"
                });
            } 
            else {
                // console.log("this is the result -->", result.dataValues.id);
                Wallet.findOrCreate({
                    where: { 
                        [Op.or]: [{user_id: result.dataValues.id}, {phone_number: phone_number}]
                    },    
                    defaults: { user_id: result.dataValues.id, fullname: fullname, balance: 0, bonus: 100, referral: phone_number, phone_number: phone_number, isActive: 1}
                }).then(([result, created]) => {
                    if((result != null) && (created == false) ){
                        res.status(302).json({
                            statusCode: "013",
                            statusMessage: "Could not create wallet for new user"
                        });
                    } else {
                        Wallet.findOne({
                            where: {
                                referral: referral
                            }
                        }).then((resp) => {
                            if(resp != null){
                                let phoneno = resp.dataValues.phone_number;
                                let original_bonus = resp.dataValues.bonus;
                                let new_bonus = parseInt(original_bonus) + 10;
                                console.log("this is the response data -->", resp);
                                console.log("this is the new bonus amount -->", new_bonus);
                                console.log("this is the original bonus -->", original_bonus);
                                Wallet.update(
                                    {
                                        bonus: new_bonus
                                    },
                                    { 
                                    where: { 
                                        [Op.and]: [{phone_number: phoneno}, {referral: referral} ]
                                    }
                                });
                            }
                        }).catch((err) => {
                            console.log("this is the error issue -->", err);
                        });
                        res.status(200).json({
                            statusCode: "000",
                            statusMessage: "User Registration Successful",
                        })
                    }
                }).catch({

                })
                
            }
        }).catch(err => {
            res.status(403).json({
                statusCode: "016",
                statusMessage: err.message
            });
            // console.error(err);
        })
}

exports.verifyAccount = (req, res) => {
    const {token} = req.params;
}

exports.createPin = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            statusCode: "012",
            statusMessage: "Validation failed, request body is not valid",
            errors: errors.array()
        });
    }

    const phone_number = req.body.phone_number;
    const user_id = req.body.user_id;
    const transactionPin = req.body.pin;

    const hashedPin = CryptoJS.AES.encrypt(transactionPin, process.env.SECRET_KEY).toString();

    // console.log("this is the hashed pin", hashedPin);

    Pin.findOrCreate({ 
        where: { 
            [Op.and]: [{phone_number: phone_number}, {user_id: user_id}, {pin: hashedPin}]
        },    
        defaults: { user_id: user_id, phone_number: phone_number, pin: hashedPin}
        }).then(([result, created]) => {
            if((result != null) && (created == false) ){
                res.status(302).json({
                    statusCode: "013",
                    statusMessage: "Duplicate Transaction PIN"
                });
            } 
            else {
                User.update(
                    {
                        isPin: 1
                    },
                    { 
                    where: { 
                        [Op.and]: [{phone_number: phone_number}, {id: user_id} ]
                    }
                }).then((result) => {
                    if(result == "null"){
                        res.status(302).json({
                            statusCode: "013",
                            statusMessage: "Something went wrong"
                        });
                    } else {
                        res.status(200).json({
                            statusCode: "000",
                            statusMessage: "Transaction PIN Generated Successful",
                        })
                    }
                }).catch((err) => {
                    res.status(403).json({
                        statusCode: "016",
                        statusMessage: err.message
                    });
                });
            }
        }).catch(err => {
            res.status(403).json({
                statusCode: "016",
                statusMessage: err.message
            });
            // console.error(err);
        })
}

exports.walletTransaction = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            statusCode: "012",
            statusMessage: "Validation failed, request body is not valid",
            errors: errors.array()
        });
    }

    const phone_number = req.body.phone_number;
    const reference_id = req.body.reference_id;
    const user_id = req.body.user_id;
    const fullname = req.body.fullname;
    const amount = req.body.amount;
    const previous_balance = req.body.previous_balance;
    const description = req.body.description;
    //const transactionPin = req.body.pin;

    Transaction.findOrCreate({ 
            where: { 
                [Op.and]: [{reference_id: reference_id}, {user_id: user_id}, {phone_number: phone_number}]
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
                const current_balance = parseInt(previous_balance) + parseInt(amount);
                console.log("current balance her -->", current_balance);
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
                        console.log("result here -->", result);
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

exports.getUserDetails = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            statusCode: "012",
            statusMessage: "Validation failed, request body is not valid",
            errors: errors.array()
        });
    }

    const phone_number = req.body.phone_number;
    const user_id = req.body.user_id;
    

    User.findOne({ 
        where: { 
            [Op.and]: [{phone_number: phone_number}, {id: user_id}]
        }
        }).then((result) => {
            if((result === null)){
                res.status(302).json({
                    statusCode: "013",
                    statusMessage: "User Not Found!"
                });
            } 
            else {
                Wallet.findOne({
                    where: { 
                        [Op.and]: [{phone_number: phone_number}, {user_id: user_id}, {isActive: 1}]
                    }
                }).then((resp) => {
                    if(resp === null){
                        res.status(404).json({
                            statusCode: '015',
                            statusMessage: 'Unable to fetch wallet details'
                        });
                    } else {
                        const data = {
                            wallet_balance: resp.dataValues.balance,
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
        
                        res.status(200).json({
                            statusCode: "000",
                            statusMessage: "User Details Retrieved Successfully",
                            payload: data,
                        });
                    }
                
                }).catch((err) => {
    
                });
            }
        }).catch(err => {
            res.status(403).json({
                statusCode: "016",
                statusMessage: err.message
            });
        })
}

exports.getTransaction = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            statusCode: "012",
            statusMessage: "Validation failed, request body is not valid",
            errors: errors.array()
        });
    }

    const phone_number = req.body.phone_number;
    const user_id = req.body.user_id;
    

    Transaction.findAll({ 
        where: { 
            user_id: user_id
        }, 
        order: [
            ["createdAt", "DESC"],
        ],
        }).then((result) => {
            // console.log("this is the result -->", result);
            if((result === null)){
                res.status(302).json({
                    statusCode: "013",
                    statusMessage: "No Transaction Found!"
                });
            } 
            else {
                // console.log("this is the transaction --> ", result);
                res.status(200).json({
                    statusCode: "000",
                    statusMessage: "Transaction Data retrieved successfully",
                    data: result
                });
            }
        }).catch(err => {
            res.status(403).json({
                statusCode: "016",
                statusMessage: err.message
            });
        })
}

const generateRandomString = (myLength) => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    const randomArray = Array.from(
        { length: myLength },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );

    const randomString = randomArray.join("");
    // console.log("this is the randomString", randomString);
    return randomString;

};