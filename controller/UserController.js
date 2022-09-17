const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment');
require('dotenv/config');
const crypto = require('crypto');
const User = require("../model/User");
const Sequelize = require("sequelize");
const { resolveSoa } = require('dns');
const Op = Sequelize.Op;


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
                referral: result.dataValues.referral,
                acctype: result.dataValues.acctype,
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

    User.findOrCreate({ 
        where: { 
            [Op.or]: [{phone_number: phone_number}, {email: email}]
        },    
        defaults: { firstname: firstname, lastname: lastname, email: email, dob: dob, referral: referral, password: hashedPassword, phone_number: phone_number, isActive: 1, acctype: acctype}
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

    console.log("this is the login details", req.body);
}

exports.verifyAccount = (req, res) => {
    const {token} = req.params;
}


