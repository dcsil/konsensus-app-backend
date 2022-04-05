const db = require('../_helpers/db');

module.exports = {
    createOrUpdate,
    getByIds,
    getPermission,
};

async function createOrUpdate(fileId, userId, updateFields, currentUser) {
    // save user
    try {
        const sharingPermission = await getPermission(fileId, currentUser.id);
        if (!sharingPermission || !sharingPermission.canShare || !sharingPermission.isAdmin) {
            throw Error('User has insufficient permissions.');
        }
        
        const newPermission = await db.Permission.findOne({
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

        if (newPermission) {
            await newPermission.update(params);
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
async function getPermission(fileId, userId) {
    const permission = await db.Permission.findOne({
        where: {
            fileId: fileId,
            userId: userId,
        },
    });

    return permission;
}