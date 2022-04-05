const db = require('../_helpers/db');
// const validatePermissions = require('../helpers/validate-permissions');
const permissionService = require('../permissions/permission.service');

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
    return link;
}