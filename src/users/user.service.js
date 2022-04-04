require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
const AWS = require('aws-sdk');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    setProfilePicture,
};

// configure the keys for accessing AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

async function authenticate({ email, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Email or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    fullUserModel = await getUser(user.id);
    return { ...fullUserModel, token };
}

async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // save user
    await db.User.create(params);
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const emailChanged = params.email && user.email !== params.email;
    if (emailChanged && await db.User.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

async function setProfilePicture(buffer, type, userId) {
    const key  =`user-profile/${userId}`;

    try {
        const uploadParams = {
            ACL: 'public-read',
            Body: buffer,
            Bucket: process.env.S3_BUCKET,
            ContentType: type.mime,
            Key: key,
        };

        await s3.upload(uploadParams).promise();

        const url = await getProfilePicture(userId);
        return url;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
// helper functions

async function getUser(id) {
    await getProfilePicture(id);
    const user = await db.User.findByPk(id);

    if (!user) throw 'User not found';
    const org = await db.Organization.findByPk(user.organizationId);
    return { ...omitHash(user.get()), organization: org.get() };
}

async function getProfilePicture(id) {
    const key = `user-profile/${id}`;

    const urlParams = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Expires: 60 * 60 * 24 * 7,       // 1 week (max time)
    };

    const url = await s3.getSignedUrlPromise('getObject', urlParams);

    await db.User.findByPk(id).then(async user => { 
        await user.update({
            image: url
        })
       
    });
    return url;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}