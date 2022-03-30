require('dotenv').config();
const AWS = require('aws-sdk');
const db = require('../_helpers/db');
const crypto = require('crypto');

module.exports = {
    upload,
    getAll,
    getById
};

// configure the keys for accessing AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

async function upload(buffer, name, type, userId) {
    const fileId = crypto.randomUUID()

    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: process.env.S3_BUCKET,
        ContentType: type.mime,
        Key: fileId,
    };

    try {
        await s3.upload(params).promise();

        fileModel = {
            id: fileId,
            name: name,
            type: type.mime,
            lastUpdater: userId,
        };

        // save file to DB, update users model, add permission
        await db.File.create(fileModel);
        await db.User.update(
            { 'ownedFiles': db.sequelize.fn('json_array_append', db.sequelize.col('ownedFiles'), '$', fileId) },
            { where: { id: userId } });
        await db.User.update(
            { 'recentFiles': db.sequelize.fn('json_array_append', db.sequelize.col('recentFiles'), '$', fileId) },
            { where: { id: userId } });
        await db.Permission.create(
            {
                userId: userId,
                fileId: fileId,
                canEdit: true,
                canShare: true,
                isAdmin: true,
            }
        );
    }
    catch (err) {
        console.log(err);
        return err;
    }
};

async function getAll() {
    return await db.File.findAll();
}

async function getById(id) {
    return await getFile(id);
}

// helpers
async function getFile(id) {
    const file = await db.File.findByPk(id);
    if (!file) throw 'File not found';
    return file;
}