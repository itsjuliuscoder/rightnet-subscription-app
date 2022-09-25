const Sequelize = require('sequelize');
const sequelize = require("../utils/db");

const Notification = sequelize.define('notifications_tbl', {
    id: {
        type: Sequelize.UUID,
        // autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    user_id: Sequelize.STRING,
    notifyText: Sequelize.TEXT,
    isStatus: Sequelize.BOOLEAN
});

module.exports = Notification;