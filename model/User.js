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
    password: Sequelize.STRING,
    referral: Sequelize.INTEGER,
    isVerified: Sequelize.BOOLEAN,
    isActive: Sequelize.BOOLEAN,
});

module.exports = User;