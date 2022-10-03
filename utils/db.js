const Sequelize = require('sequelize');
require('dotenv/config');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    // pool: {
    //     max: 50,
    //     min: 0,
    //     acquire: 30000,
    //     idle: 10000
    // }
});

module.exports = sequelize;
