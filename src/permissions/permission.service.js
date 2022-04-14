const db = require('../_helpers/db');
// const userService = require('../users/user.service');

module.exports = {
    createOrUpdate,
    updateByEmail,
    getByIds,
    getPermission,
    getUsersWithFile,
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

async function updateByEmail(fileId, updateFields, currentUser) {
    const user = await db.User.findOne({
        where: {
            email: updateFields.email,
        },
    });

    const result = await createOrUpdate(fileId, user.id, updateFields, currentUser);
    return result;
}

async function getByIds(fileId, userId) {
    return await db.Permission.findOne({
        where: {
            fileId: fileId,
            userId: userId,
        },
    });
}

// async function getUsersWithFile(fileId) {
//     const permissions = await db.Permission.findAll({
//         where: {
//             fileId: fileId,
//         },
//         raw: true,
//     });
    
//     const result = await Promise.all( permissions.map(async permission => {
//         const user = await db.User.findByPk(permission.userId);
//         const publicUser = userService.getPublicUser(user.dataValues);
//         return {...permission, ...publicUser};
//     }));
    
//     return result;
// }

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