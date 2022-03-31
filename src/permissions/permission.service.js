const db = require('../_helpers/db');

module.exports = {
    createOrUpdate,
    getByIds,
};

async function createOrUpdate(fileId, userId, updateFields, currentUser) {
    // save user
    try {
        validatePermissions(fileId, currentUser);
        
        const permission = await db.Permission.findOne({
            where: {
                fileId: fileId,
                userId: userId,
            },
        });

        const params = {
            ...updateFields, 
            fileId: fileId, 
            userId: userId
        };

        if (permission) {
            await permission.update(params);
            return "Permission updated.";
        } else {
            await db.Permission.create(params);
            return "Permission created.";
        }
    }
    catch(err) {
        console.log(err);
        throw err;
    }
}

async function getByIds(fileId, userId) {
    return await db.Permission.findOne({
        where: {
            fileId: fileId,
            userId: userId,
        },
    });
}

// helpers
async function validatePermissions(fileId, currentUser) {
    const permission = await db.Permission.findOne({
        where: {
            fileId: fileId,
            userId: currentUser.id,
        },
    });

    if (!permission || !permission.canShare || !permission.isAdmin) {
        throw Error('User has insufficient permissions.');
    }
}