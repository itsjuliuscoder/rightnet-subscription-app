const Sequelize = require('sequelize');
const sequelize = require("../utils/db");

const Pin = sequelize.define('transPin_table', {
    id: {
        type: Sequelize.UUID,
        // autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    user_id: Sequelize.STRING,
    phone_number: Sequelize.STRING,
    pin: Sequelize.STRING
});

module.exports = Pin;