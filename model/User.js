const Sequelize = require('sequelize');
const sequelize = require("../utils/db");

const User = sequelize.define('users', {
    id: {
        type: Sequelize.UUID,
        // autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    firstname: Sequelize.STRING,
    lastname: Sequelize.STRING,
    email: Sequelize.STRING,
    phone_number: Sequelize.STRING,
    dob: Sequelize.STRING,
    acctype: Sequelize.STRING,
    password: Sequelize.STRING,
    referral_id: Sequelize.STRING,
    referral_code: Sequelize.STRING,
    isVerified: Sequelize.BOOLEAN,
    isActive: Sequelize.BOOLEAN,
});

module.exports = User;