const jwt = require('jsonwebtoken');
const User = require("../model/User");

module.exports = (req, res, next) => {
    const access_token = req.get("Authorization");
    // const access_token = req.headers.access_token;

    //console.log("this is the authheader -->", authHeader);
    // console.log("this is the access token -->", access_token);
    
    // const requestBody = req.body;
    if(!access_token) {
        const error = new Error('Not authorized');
        error.statusCode = 401;
        res.status(401).json({
            "statusCode": "016",
            "statusMessage": "You are not authorized to access this route"
        });
    } else {
        let accessToken = access_token.replace("Bearer", "");
        token = accessToken.trim();
    
        console.log("this is the token -->", token);
        
        try{
            const decodedToken =  jwt.verify(token, process.env.JWT_SECRET);
            console.log("this is the decodedToken", decodedToken);
            User.findOne({
                where: { phone_number: decodedToken.username, password: decodedToken.password, isActive: 1 }
            }).then((result) => {
                if(result === null){
                    res.status(404).json({
                        statusCode: '015',
                        statusMessage: 'Invalid Token!'
                    });
                } else {
                    next();
                    console.log("we got here");
                }
            }).catch((err) => {
                res.status(403).json({
                    statusCode: "016",
                    statusMessage: err.message
                });
            })
        } catch(err) {
            res.status(401).json({
                statusCode: "018",
                statusMessage: "Token expired, generate a new token!"
            });
        }

    }
};