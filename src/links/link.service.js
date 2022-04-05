const db = require('../_helpers/db');
const fileService = require('../files/file.service');

module.exports = {
    share,
    getByShareToken,
};

async function share(fields, currentUser) {
    // save user
    try {
        fileService.validatePermissions(currentUser.id, fields.fileId, 'share');
        console.log('currentUser.id :>> ', currentUser.id);
        console.log('typeof currentUser.id :>> ', typeof currentUser.id);
        const params = {
            ...fields,
            sharerId: currentUser.id,
        }
        console.log('params :>> ', params);
        const link = await db.Link.create(params);
        console.log('link.dataValues :>> ', link.dataValues);
        return link.dataValues.shareToken;
        // return "nnothing";
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