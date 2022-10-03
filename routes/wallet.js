const express = require('express');
const { body } = require('express-validator');
const WalletController = require("../controller/WalletController");
const privateAuth = require("../middleware/privateAuth");

const router = express.Router();

router.get('/getAllProducts', WalletController.getAllServices);

router.get('/testAirtime', WalletController.testAirtime);

router.post(
    '/buyAirtime',
    [
        body('msisdn')
            .trim()
            .isLength({ min: 6, max: 20 }),
        body('amount')
            .trim()
            .isLength({ min: 1, max: 20 }),
        body('transactionId')
            .trim()
            .isLength({ min: 1, max: 50 }),
        body('amount_charged')
            .trim()
            .isLength({ min: 1, max: 20 }),
        body('user_id')
            .trim()
            .isLength({ min: 1, max: 50 }),
        body('transactionId')
            .trim()
            .isLength({ min: 6, max: 50 }),
        body('phone_number')
            .trim()
            .isLength({ min: 1, max: 20 }),
        body('pin')
            .trim()
            .isLength({ min: 4, max: 4 })
    ],
    WalletController.purchaseAirtime);


router.post(
    '/buyData',
    [
        body('msisdn')
            .trim()
            .isLength({ min: 6, max: 20 }),
        body('amount')
            .trim()
            .isLength({ min: 1, max: 20 }),
        body('transactionId')
            .trim()
            .isLength({ min: 1, max: 50 }),
        body('amount_charged')
            .trim()
            .isLength({ min: 1, max: 20 }),
        body('user_id')
            .trim()
            .isLength({ min: 1, max: 50 }),
        body('transactionId')
            .trim()
            .isLength({ min: 6, max: 50 }),
        body('phone_number')
            .trim()
            .isLength({ min: 1, max: 20 }),
        body('pin')
            .trim()
            .isLength({ min: 4, max: 4 })
    ],
    WalletController.purchaseData);

router.post(
    '/pinValidation',
    [
        body('user_id')
            .trim()
            .isLength({ min: 7, max: 50 }),
        body('phone_number')
            .trim()
            .isLength({ min: 7, max: 13 }),
        body('pin')
            .trim()
            .isLength({ min: 4, max: 4 }),
    ],
    WalletController.validatePin);

// router.post(
//     '/create_transactionPin',
//     privateAuth,
//     [
//         body('user_id')
//             .trim()
//             .isLength({ min: 7, max: 50 }),
//         body('phone_number')
//             .trim()
//             .isLength({ min: 7, max: 11 }),
//         body('pin')
//             .trim()
//             .isLength({ min: 4, max: 10 }),
//     ],
//     WalletController.createPin);

// router.post(
//     '/wallet_transaction',
//     privateAuth,
//     [
//         body('user_id')
//             .trim()
//             .isLength({ min: 7, max: 50 }),
//         body('fullname')
//             .trim()
//             .isLength({ min: 7, max: 100 }),
//         body('phone_number')
//             .trim()
//             .isLength({ min: 7, max: 11 }),
//         body('description')
//             .trim()
//             .isLength({ min: 4, max: 2000 }),
//     ],
//     WalletController.walletTransaction);

// router.post(
//     '/register',
//     // privateAuth,
//     [
//         body('phone_number')
//             .trim()
//             .isLength({ min: 7, max: 20 }),
//         body('password')
//             .trim()
//             .isLength({ min: 7, max: 30 }),
//         body('firstname')
//             .trim()
//             .isLength({ min: 3, max: 20 }),
//         body('lastname')
//             .trim()
//             .isLength({ min: 3, max: 30 }),
//         body('dob')
//             .trim()
//             .isLength({ min: 7, max: 20 }),
//         body('acctype')
//             .trim()
//             .isLength({ min: 7, max: 20 }),
        
//     ],
//     WalletController.registerUser);

// router.get(
//     '/verify/:token',
//     WalletController.verifyAccount);



module.exports = router;