const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment');
require('dotenv/config');
const crypto = require('crypto');
const User = require("../model/User");
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

            const data = {
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
    const dob = req.body.dob;
    const email = req.body.email ? req.body.email : "";
    const referral = req.body.referral_code;
    const acctype = req.body.acctype;
    const password = req.body.password;
    const hashedPassword = password;

    const code = generateRandomString(8);

    User.findOrCreate({ 
        where: { 
            [Op.or]: [{phone_number: phone_number}, {email: email}]
        },    
        defaults: { firstname: firstname, lastname: lastname, email: email, dob: dob, referral_id: referral, referral_code: code, password: hashedPassword, phone_number: phone_number, isActive: 1, isPin: 0, acctype: acctype}
        }).then(([result, created]) => {
            if((result != null) && (created == false) ){
                res.status(302).json({
                    statusCode: "013",
                    statusMessage: "Phone Number & Email Address Already Exists!"
                });
            } 
            else {
                res.status(200).json({
                    statusCode: "000",
                    statusMessage: "User Registered Successful",
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
            [Op.and]: [{phone_number: phone_number}, {user_id: user_id}]
        }
        }).then((result) => {
            if((result === null)){
                res.status(302).json({
                    statusCode: "013",
                    statusMessage: "User Not Found!"
                });
            } 
            else {
                const data = {
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
                    statusMessage: "User details retrieved successfully",
                    payload: data
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


