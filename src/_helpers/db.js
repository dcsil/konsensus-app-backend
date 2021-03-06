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
    db.User = require('../users/user.model')(sequelize);
    db.File = require('../files/file.model')(sequelize);
    db.Organization = require('../organizations/organization.model')(sequelize);
    db.Permission = require('../permissions/permission.model')(sequelize);
    db.Link = require('../links/link.model')(sequelize);
    
    db.sequelize = sequelize;
    // sync all models with database
    await sequelize.sync();
    connection.end();
}