const Sequelize = require('sequelize');
const sequelize = require("../utils/db");

const Wallet = sequelize.define('wallet', {
    id: {
        type: Sequelize.UUID,
        // autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    user_id: Sequelize.STRING,
    fullname: Sequelize.STRING,
    phone_number: Sequelize.STRING,
    balance: Sequelize.STRING,
    bonus: Sequelize.STRING,
    referral: Sequelize.STRING,
    isActive: Sequelize.BOOLEAN,
});

module.exports = Wallet;