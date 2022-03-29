require('dotenv').config();

// const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
module.exports = db = {};

initialize();

async function initialize() {
    
    const host = process.env.MYSQLDB_HOST;
    // create db if it doesn't already exist
    const config = {
        host: host,
        port: process.env.MYSQLDB_PORT,
        user: process.env.MYSQLDB_USER,
        password: process.env.MYSQLDB_PASSWORD,
        database: process.env.MYSQLDB_DATABASE
    }
    console.log('database config :>> ', config);

    const connection = await mysql.createConnection(config);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQLDB_DATABASE}\`;`);

    // connect to db
    const sequelize = new Sequelize(
        process.env.MYSQLDB_DATABASE, 
        process.env.MYSQLDB_USER, 
        process.env.MYSQLDB_PASSWORD, 
        { 
            dialect: 'mysql', 
            host: host, 
            port: process.env.MYSQLDB_PORT, 
            logging: false 
        }
    );
    
    // init models and add them to the exported db object
    db.User = require('../user/user.model')(sequelize);
    db.File = require('../file/file.model')(sequelize);
    db.Organization = require('../organization/organization.model')(sequelize);

    // sync all models with database
    await sequelize.sync();
    connection.end();
}