const express = require('express');
const { body } = require('express-validator');
const UserController = require("../controller/UserController");
const privateAuth = require("../middleware/privateAuth");

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
    '/get_UserDetails',
    privateAuth,
    [
        body('user_id')
            .trim()
            .isLength({ min: 7, max: 20 }),
        body('phone_number')
            .trim()
            .isLength({ min: 7, max: 30 }),
    ],
    UserController.getUserDetails);

router.post(
    '/create_transactionPin',
    privateAuth,
    [
        body('user_id')
            .trim()
            .isLength({ min: 7, max: 50 }),
        body('phone_number')
            .trim()
            .isLength({ min: 7, max: 11 }),
        body('pin')
            .trim()
            .isLength({ min: 4, max: 4 }),
    ],
    UserController.createPin);

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
            .isLength({ min: 3, max: 30 }),
        body('dob')
            .trim()
            .isLength({ min: 7, max: 20 }),
        body('acctype')
            .trim()
            .isLength({ min: 7, max: 20 }),
        
    ],
    UserController.registerUser);

router.get(
    '/verify/:token',
    UserController.verifyAccount);



module.exports = router;