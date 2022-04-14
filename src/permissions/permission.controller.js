const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const permissionService = require('./permission.service');
// const { Organizations } = require('aws-sdk');

// routes
router.put('/:fileId/:userId', authorize(), updateSchema, createOrUpdate);
// router.put('/:fileId', authorize(), updateByEmailSchema, updateByEmail);
router.get('/:fileId/:userId', authorize(), getByIds)
// router.get('/:fileId', authorize(), getUsersWithFile);

function updateSchema(req, res, next) {
    const schema = Joi.object({
        canView: Joi.boolean(),
        canEdit: Joi.boolean(),
        canShare: Joi.boolean(),
        isAdmin: Joi.boolean(),
    });

    validateRequest(req, next, schema);
}

function createOrUpdate(req, res, next) {
    permissionService.createOrUpdate(req.params.fileId, req.params.userId, req.body, req.user)
        .then((message) => res.json({ message: message }))
        .catch(next);
}

// function updateByEmailSchema(req, res, next) {
//     const schema = Joi.object({
//         email: Joi.string().required(),
//         canView: Joi.boolean(),
//         canEdit: Joi.boolean(),
//         canShare: Joi.boolean(),
//         isAdmin: Joi.boolean(),
//     });

//     validateRequest(req, next, schema);
// }

// function updateByEmail(req, res, next) {
//     permissionService.updateByEmail(req.params.fileId, req.body, req.user)
//         .then((message) => res.json({ message: message }))
//         .catch(next);
// }

function getByIds(req, res, next) {
    permissionService.getByIds(req.params.fileId, req.params.userId)
        .then((permission) => res.json(permission))
        .catch(next);
}

// function getUsersWithFile(req, res, next) {
//     permissionService.getUsersWithFile(req.params.fileId)
//         .then((permission) => res.json(permission))
//         .catch(next);
// }

module.exports = router;