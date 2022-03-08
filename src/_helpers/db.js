require('dotenv').config();

// const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
module.exports = db = {};

initialize();

async function initialize() {
    
    const host = process.env.DOCKER ? process.env.MYSQLDB_DOCKER_HOST : process.env.MYSQLDB_LOCAL_HOST;
    // create db if it doesn't already exist
    const config = {
        host: host,
        port: process.env.MYSQLDB_LOCAL_PORT,
        user: process.env.MYSQLDB_USER,
        password: process.env.MYSQLDB_ROOT_PASSWORD,
        database: process.env.MYSQLDB_DATABASE
    }
    // const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection(config);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQLDB_DATABASE}\`;`);

    // connect to db
    const sequelize = new Sequelize(
        process.env.MYSQLDB_DATABASE, 
        process.env.MYSQLDB_USER, 
        process.env.MYSQLDB_ROOT_PASSWORD, 
        { 
            dialect: 'mysql', 
            host: host, 
            port: process.env.MYSQLDB_LOCAL_PORT, 
            logging: false 
        }
    );
    
    // init models and add them to the exported db object
    db.User = require('../users/user.model')(sequelize);

    // sync all models with database
    await sequelize.sync();
    connection.end();
}