const express = require('express');
const { body } = require('express-validator');
const UserController = require("../controller/UserController");

const router = express.Router();


router.post(
    '/login',
    // privateAuth,
    [
        body('phone_number')
            .trim()
            .isLength({ min: 7, max: 20 }),
        body('password')
            .trim()
            .isLength({ min: 7, max: 30 }),
    ],
    UserController.loginUser);

router.post(
    '/register',
    // privateAuth,
    [
        body('phone_number')
            .trim()
            .isLength({ min: 7, max: 20 }),
        body('password')
            .trim()
            .isLength({ min: 7, max: 30 }),
        body('firstname')
            .trim()
            .isLength({ min: 3, max: 20 }),
        body('lastname')
            .trim()
            .isLength({ min: 7, max: 30 }),
        body('dob')
            .trim()
            .isLength({ min: 7, max: 20 }),
        body('referral_code')
            .trim()
            .isLength({ min: 7, max: 30 }),
        body('acctype')
            .trim()
            .isLength({ min: 7, max: 20 }),
        
    ],
    UserController.registerUser);

router.get(
    '/verify/:token',
    UserController.verifyAccount);



module.exports = router;