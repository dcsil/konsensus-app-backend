const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const linkService = require('./link.service');
// const { Organizations } = require('aws-sdk');

// routes
router.post('/share', authorize(), shareSchema, share);
router.get('/:shareToken', getByShareToken)

function shareSchema(req, res, next) {
    const schema = Joi.object({
        fileId: Joi.string().required(),
        email: Joi.string().required(),
    });

    validateRequest(req, next, schema);
}

function share(req, res, next) {
    linkService.share(req.body, req.user)
        .then((shareToken) => res.json(
            { shareToken: shareToken }))
        .catch(next);
}

function getByShareToken(req, res, next) {
    linkService.getByShareToken(req.params.shareToken)
        .then((link) => res.json(link))
        .catch(next);
}

module.exports = router;