require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
// const AWS = require('aws-sdk');
const aws = require('../_helpers/aws');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    setProfilePicture,
    update,
    delete: _delete,
    getPublicUser
};

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
    console.log('getting current user: id :>> ', id);
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
    return await db.User.create(params);
}

async function update(id, params) {
    let user = await getUser(id);
    console.log('params :>> ', params);
    console.log('user :>> ', user);

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
    await db.User.update(params, { where: { id: id }});
    user = await getUser(id);
    return omitHash(user);
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

async function setProfilePicture(file, userId) {
    const key  =`user-profile/${userId}`;

    await aws.uploadToS3(file, key);

    const url = await getProfilePicture(userId);
    return url;
}
// helper functions

async function getUser(id) {
    if (!process.env.test) {
        console.log('not a test env, getting prof pic');
        await getProfilePicture(id);
    }
    const user = await db.User.findByPk(id);

    if (!user) throw 'User not found';
    const org = await db.Organization.findByPk(user.organizationId);
    return { ...omitHash(user.get()), organization: org.get() };
}

async function getProfilePicture(id) {
    const key = `user-profile/${id}`;

    try {
        const params = {
            Bucket: process.env.S3_BUCKET ? process.env.S3_BUCKET : '',
            Key: key,
        };
    
        const hasObject = await aws.hasObject(params);
        if (!hasObject) {
            return null;
        }
    
        const url = await aws.getSignedUrl({...params, Expires: 60 * 60 * 24 * 7 });  // max 1 week
        await db.User.findByPk(id).then(async user => { 
            await user.update({
                image: url
            })
        });
        return url;
    }
    catch (err) {
        console.log('error in userService.getProfilePicture:>> ', err);
        return "";
    }
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

function getPublicUser(user) {
    const { hash, ownedFiles, starredFiles, recentFiles, ...publicUser } = user;
    return publicUser;
}