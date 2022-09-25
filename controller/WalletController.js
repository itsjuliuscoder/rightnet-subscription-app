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

exports.getWalletDetails = (req, res) => {
    
}

exports.getAirtimeBalance = (req, res) => {

}

exports.getDataBalance = (req, res) => {

}

exports.purchaseAirtime = (req, res) => {

}

exports.purchaseData = (req, res) => {

}

exports.getAllServices = (req, res) => {

}

