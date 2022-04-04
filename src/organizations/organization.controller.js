const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const organizationService = require('./organization.service');
const multiparty = require('multiparty');
const fs = require('fs');

// routes
router.post('/create', createSchema, create);
router.put('/picture', authorize(), setProfilePicture);
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

function setProfilePicture(req, res, next) {
    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {

        if (error) {
            return res.status(500).send(error);
        };

        try {
            const file = files.file[0];
            const buffer = fs.readFileSync(file.path);
            /**
             * Import 'file-type' ES-Module in CommonJS Node.js module
            */
            const { fileTypeFromBuffer } = await (eval('import("file-type")'));
            const type = await fileTypeFromBuffer(buffer);
            const id = req.user.organizationId;

            const data = await organizationService.setProfilePicture(buffer, type, id);
            return res.status(200).send(data);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    });
}
