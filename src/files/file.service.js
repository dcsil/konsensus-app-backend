require('dotenv').config();
const db = require('../_helpers/db');
const crypto = require('crypto');
const { Op } = require("sequelize");
const aws = require('../_helpers/aws');
const permissionService = require('../permissions/permission.service');
const userService = require('../users/user.service');

module.exports = {
    upload,
    reupload,
    getAll,
    getById,
    accessById,
    star,
    createNewFileInDb,
    getFilesByIds
};

async function upload(file, userId) {
    const fileId = crypto.randomUUID()
    
    const result = await aws.uploadToS3(file, fileId);

    const params = {
        id: fileId,
        name: file.originalFilename,
        type: result?.type?.mime,
        lastUpdater: userId,
        size: file.size,
    };

    // save file to DB, update users model, add permission
    const fileModel = await createNewFileInDb(params);
    return fileModel;
};

async function reupload(file, fileId, userId) {

    const editPermission = await permissionService.getPermission(fileId, userId)
    if (!editPermission || !editPermission.canEdit) {
        throw Error('User has insufficient permissions to edit/reupload file.');
    }

    let result = await aws.uploadToS3(file, fileId);

    fileModel = {
        id: fileId,
        name: file.originalFilename,
        type: result.type.mime,
        lastUpdater: userId,
    };

    await db.File.update(fileModel, { where: { id: fileId } });
};

async function star(user, fileId) {
  const userId = user.id;
  const starredFiles = user.starredFiles;

    try {
        const viewPermission = await permissionService.getPermission(fileId, userId);
        if (!viewPermission || !viewPermission.canView) {
            throw Error('User has insufficient permissions view/star file.');
        }

        if (starredFiles.includes(fileId)) {
            starredFiles.splice(starredFiles.indexOf(fileId), 1);
            await db.User.update(
                { 'starredFiles': starredFiles},
                { where: { id: userId } });
            return "Successfully unstarred file."
        } else {
            await db.User.update(
                { 'starredFiles': db.sequelize.fn('json_array_append', db.sequelize.col('starredFiles'), '$', fileId) },
                { where: { id: userId } });
            return "Successfully starred file."
        }
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

async function getAll(userId) {
  try {
    const permissions = await db.Permission.findAll({
      where: {
        userId: userId,
        canView: true,
      },
    });
    const fileIds = permissions.map(
      (permission) => permission.fileId
    );
    return await db.File.findAll({
      where: {
        id: {
          [Op.in]: fileIds,
        },
      },
    });
  } catch (err) {
    console.log(err);
    throw Error('Error getting all files.');
  }
}

async function getById(user, id) {
    const permission = await permissionService.getPermission(id, user.id)
    if (!permission || !permission.canView) {
        throw Error('User has insufficient permissions to get the File Model.');
    }
    return await getFile(id);
}

async function accessById(user, id) {
    try {
        const permission = await permissionService.getPermission(id, user.id)
        if (!permission || !permission.canView) {
            throw Error('User has insufficient permissions to view the file.');
        }

    const fileModel = await getFile(id);
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: fileModel.id,
    };

        const url = await aws.getSignedUrl(
            {
                ...params,
                Expires: 60 * 10,       // 10 minutes
            }
        );

        const object = await aws.getObject(params);

    return { ...fileModel.dataValues, url: url, object: object };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// helpers
async function getFile(id) {
  const file = await db.File.findByPk(id);
  if (!file) throw Error('File not found');
  return file;
}

async function createNewFileInDb(fileModel) {
    const file = await db.File.create(fileModel);
    const userId = fileModel.lastUpdater;
    const fileId = fileModel.id;
    
    await db.User.update(
        { 'ownedFiles': db.sequelize.fn('json_array_append', db.sequelize.col('ownedFiles'), '$', fileId) },
        { where: { id: userId } });
    await db.User.update(
        { 'recentFiles': db.sequelize.fn('json_array_append', db.sequelize.col('recentFiles'), '$', fileId) },
        { where: { id: userId } });
    await db.Permission.create(
        {
            userId: userId,
            fileId: fileId,
            canEdit: true,
            canShare: true,
            isAdmin: true,
        }
    );
    return file
}

async function getFilesByIds(ids) {
  const files = await db.File.findAll({
    where: { id: { [Op.in]: ids, }, }, raw: true,
  });

  const result = await Promise.all(files.map(async file => {
    const permissions = await db.Permission.findAll({
      where: {
        fileId: file.id
      },
      raw: true,
    });

    const collaboratorIds = permissions.map(permission => permission.userId);
    let collaborators = await db.User.findAll({
      where: { id: { [Op.in]: collaboratorIds, },}, raw: true,
    });
    collaborators = collaborators.map(collaborator => userService.getPublicUser(collaborator));

    return {
      ...file, collaborators: collaborators
    }
  }));
  return result;
}
