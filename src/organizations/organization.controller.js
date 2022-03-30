const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const organizationService = require('./organization.service');
// const { Organizations } = require('aws-sdk');

// routes
router.post('/create', createSchema, create);
router.get('/', authorize(), getAll)

module.exports = router;

function createSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    organizationService.create(req.body)
        .then(() => res.json({ message: 'Creation successful' }))
        .catch(next);
}

function getAll(req, res, next) {
    organizationService.getAll()
        .then(organizations => res.json(organizations))
        .catch(next);
}
