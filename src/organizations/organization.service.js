const db = require('../_helpers/db');

module.exports = {
    create,
    getAll,
    setPicture
};

// configure the keys for accessing AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

async function create(params) {
    await db.Organization.create(params);
}

async function getAll() {
    return await db.Organization.findAll();
}

async function setPicture(buffer, type, organizationId) {
    const key  =`organization-pictures/${organizationId}`;

    try {
        const uploadParams = {
            ACL: 'public-read',
            Body: buffer,
            Bucket: process.env.S3_BUCKET,
            ContentType: type.mime,
            Key: key,
        };

        await s3.upload(uploadParams).promise();

        const url = await getPicture(organizationId);
        console.log('url :>> ', url);
        return url;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

// helper
async function getPicture(id) {
    const key = `organization-pictures/${id}`;

    const urlParams = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Expires: 60 * 60 * 24 * 7,       // 1 week (max time)
    };

    const url = await s3.getSignedUrlPromise('getObject', urlParams);
    // console.log('url :>> ', url);

    await db.User.findByPk(id).then(async user => { 
        // console.log('user :>> ', user);
        await user.update({
            image: url
        })
       
    });
    return url;
}