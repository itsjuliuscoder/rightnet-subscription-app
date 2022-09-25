const Sequelize = require('sequelize');
const sequelize = require("../utils/db");

const Transaction = sequelize.define('transaction', {
    id: {
        type: Sequelize.UUID,
        // autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    user_id: Sequelize.STRING,
    reference_id: Sequelize.STRING,
    fullname: Sequelize.STRING,
    phone_number: Sequelize.STRING,
    amount: Sequelize.STRING,
    transtype: Sequelize.STRING,
    previous_balance: Sequelize.STRING,
    description: Sequelize.STRING,
});

module.exports = Transaction;