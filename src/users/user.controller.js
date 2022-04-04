const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const userService = require('./user.service');
const multiparty = require('multiparty');
const fs = require('fs');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.get('/all', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/picture', authorize(), setProfilePicture);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('user', 'admin'),
        organizationId: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
        .then((user) => res.json(user))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getCurrent(req, res, next) {
    userService.getById(req.user.id)
        .then(user => res.json(user))
        .catch(next);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().empty(''),
        password: Joi.string().min(6).empty('')
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
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
            const userId = req.user.id;

            const data = await userService.setProfilePicture(buffer, type, userId);
            return res.status(200).send(data);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    });
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}