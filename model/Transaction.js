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
    fullname: Sequelize.STRING,
    amount: Sequelize.STRING,
    description: Sequelize.STRING,
});

module.exports = Transaction;