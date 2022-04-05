const db = require('../_helpers/db');
const permissionService = require('../permissions/permission.service');
const aws = require('../_helpers/aws');

module.exports = {
    share,
    getByShareToken,
};

async function share(fields, currentUser) {
    // save user
    try {
        const permission = await permissionService.getPermission(fields.fileId, currentUser.id);
        if (!permission || !permission.canShare || !permission.isAdmin) {
            throw Error('User has insufficient permissions to share this file.');
        }

        const params = {
            ...fields,
            sharerId: currentUser.id,
        }
        const link = await db.Link.create(params);
        return link.dataValues.shareToken;
    }
    catch(err) {
        console.log(err);
        return err;
    }
}

async function getByShareToken(shareToken) {
    const link = await db.Link.findOne({
        where: {
            shareToken: shareToken,
        },
    });

    const urlParams = {
        Bucket: process.env.S3_BUCKET,
        Key: link.dataValues.fileId,
        Expires: 60 * 10,       // 10 minutes
    };
    const url = await aws.getSignedUrl(urlParams);

    return {link: link.dataValues, url: url};
}