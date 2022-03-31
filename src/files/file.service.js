require('dotenv').config();
const AWS = require('aws-sdk');
const db = require('../_helpers/db');
const crypto = require('crypto');

module.exports = {
    upload,
    getAll,
    getById,
    accessById
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

async function accessById(user, id) {
    try {
        validatePermissions(user.id, id, 'read');

        const fileModel = await getFile(id);
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: fileModel.id,
        };

        const url = await s3.getSignedUrlPromise('getObject',
            {
                ...params,
                Expires: 60 * 10,       // 10 minutes
            }
        );

        const object = await s3.getObject(params).promise();

        return {...fileModel.dataValues, url: url, object: object};
    }
    catch (err) {
        console.log(err);
        return err
    }
}

// helpers
async function getFile(id) {
    const file = await db.File.findByPk(id);
    if (!file) throw Error('File not found');
    return file;
}


async function validatePermissions(userId, fileId, action) {
    let permission;
    switch (action) {
        case 'read':
            permission = await db.Permission.findOne({
                where: {
                    userId: userId,
                    fileId: fileId,
                    canView: true,
                }
            });
            break;
        case 'write':
            permission = await db.Permission.findOne({
                where: {
                    userId: userId,
                    fileId: fileId,
                    canView: true,
                    canWrite: true,
                }
            });
            break;
        case 'share':
            permission = await db.Permission.findOne({
                where: {
                    userId: userId,
                    fileId: fileId,
                    canView: true,
                    canWrite: true,
                    canShare: true,
                }
            });
            break;
        case 'admin':
            permission = await db.Permission.findOne({
                where: {
                    userId: userId,
                    fileId: fileId,
                    isAdmin: true,
                }
            });
            break;
        default:
            throw Error('Invalid action provided.')

    }
    if (!permission) throw Error('User does not have necessary permissions');
    return permission;
}