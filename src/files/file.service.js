require('dotenv').config();
const AWS = require('aws-sdk');
const db = require('../_helpers/db');
const crypto = require('crypto');
const { Op } = require("sequelize");

module.exports = {
    upload,
    reupload,
    getAll,
    getById,
    accessById,
    getOwnedFiles,
    getStarredFiles,
    getRecentFiles,
    star
};

// configure the keys for accessing AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

async function upload(buffer, name, type, userId, uploadToS3=true) {
    const fileId = crypto.randomUUID()

    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: process.env.S3_BUCKET,
        ContentType: type?.mime,
        Key: fileId,
    };

    try {
        if (uploadToS3) {
            await s3.upload(params).promise();
        }

        fileModel = {
            id: fileId,
            name: name,
            type: type?.mime,
            lastUpdater: userId,
        };

        // save file to DB, update users model, add permission
        const file = await db.File.create(fileModel);
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
        return file;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
};

async function reupload(buffer, name, type, fileId, userId) {

    try {
        await validatePermissions(userId, fileId, 'write');

        const params = {
            ACL: 'public-read',
            Body: buffer,
            Bucket: process.env.S3_BUCKET,
            ContentType: type.mime,
            Key: fileId,
        };

        await s3.upload(params).promise();

        fileModel = {
            id: fileId,
            name: name,
            type: type.mime,
            lastUpdater: userId,
        };

    }
    catch (err) {
        console.log(err);
        throw err;
    }
};

async function star(user, fileId) {
    const userId = user.id;
    const starredFiles = user.starredFiles;

    try {
        await validatePermissions(userId, fileId, 'read');

        if (starredFiles.includes(fileId)) {
            starredFiles.splice(starredFiles.indexOf(fileId), 1);
            await db.User.update(
                { 'starredFiles': starredFiles},
                { where: { id: userId } });
            return "Successfully unstarred file."
        } else {
            await db.User.update(
                { 'starredFiles': db.sequelize.fn('json_array_append', db.sequelize.col('starredFiles'), '$', fileId) },
                { where: { id: userId } });
            return "Successfully starred file."
        }
    }
    catch (err) {
        console.log(err);
        throw Error('Error starring file.');
    }
}

async function getAll(userId) {
    try {
        const permissions = await db.Permission.findAll(
            {
                where: {
                    userId: userId,
                    canView: true,
                }
            }
        )
        const fileIds = permissions.map(permission => permission.fileId);
        return await db.File.findAll({
            where: {
                id: {
                    [Op.in]: fileIds
                }
            }
        });
    }
    catch (err) {
        console.log(err);
        throw Error('Error getting all files.');
    }
}

async function getById(id) {
    return await getFile(id);
}

async function accessById(user, id) {
    try {
        await validatePermissions(user.id, id, 'read');

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
        throw err;
    }
}

async function getOwnedFiles(user) {
    const fileIds = user.ownedFiles;
    const files = await db.File.findAll({
        where: {
            id: {
                [Op.in]: fileIds
            }
        }
    });
    return files;
}

async function getRecentFiles(user) {
    const fileIds = user.recentFiles;
    const files = await db.File.findAll({
        where: {
            id: {
                [Op.in]: fileIds
            }
        }
    });
    return files;
}

async function getStarredFiles(user) {
    const fileIds = user.starredFiles;
    const files = await db.File.findAll({
        where: {
            id: {
                [Op.in]: fileIds
            }
        }
    });
    return files;
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