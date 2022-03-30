require('dotenv').config();
const AWS = require('aws-sdk');
const db = require('../_helpers/db');
const crypto = require('crypto');

module.exports = {
    upload
};

// configure the keys for accessing AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

async function upload(buffer, name, type, userId) {
    const id = crypto.randomUUID()

    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: process.env.S3_BUCKET,
        ContentType: type.mime,
        Key: id,
    };

    s3.upload(params).promise()
        .then(async data => {

            fileModel = {
                id: id,
                name: `${name}.${type.ext}`,
                type: type.mime,
                lastUpdater: userId,
            }
            console.log('fileModel :>> ', fileModel);
            // save file to DB
            await db.File.create(fileModel);
            return data;
    })
    .catch(err => {
        return err;
    });
};
