require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
// const fileType = require('file-type');
const multiparty = require('multiparty');

module.exports = {
    upload
};

// configure the keys for accessing AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

async function upload(buffer, name, type) {
    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: process.env.S3_BUCKET,
        ContentType: type.mime,
        Key: `${name}.${type.ext}`,
    };
    return s3.upload(params).promise();
};
