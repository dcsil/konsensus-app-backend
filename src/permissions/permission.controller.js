const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const permissionService = require('./permission.service');
// const { Organizations } = require('aws-sdk');

// routes
router.put('/:fileId/:userId', authorize(), updateSchema, createOrUpdate);
router.get('/:fileId/:userId', authorize(), getByIds)

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

function getByIds(req, res, next) {
    permissionService.getByIds(req.params.fileId, req.params.userId)
        .then((permission) => res.json(permission))
        .catch(next);
}

module.exports = router;