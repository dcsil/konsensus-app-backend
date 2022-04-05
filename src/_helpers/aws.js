const AWS = require('aws-sdk');
const fs = require('fs');

module.exports = {
    uploadToS3,
    getSignedUrl,
    getObject
};

// configure the keys for accessing AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

async function uploadToS3(file, key) {

    const buffer = fs.readFileSync(file.path);
    
    // Import 'file-type' ES-Module as CommonJS Node.js module
    const { fileTypeFromBuffer } = await (eval('import("file-type")'));
    const type = await fileTypeFromBuffer(buffer);

    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: process.env.S3_BUCKET,
        ContentType: type?.mime,
        Key: key,
    };
    await s3.upload(params).promise();

    return {
        type: type
    }
}

async function getSignedUrl(params) {
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
}

async function getObject(params) {
    const data = await s3.getObject(params).promise();
    return data;
}