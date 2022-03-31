const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const filesService = require('./file.service');
// const fileType = require('file-type');
const multiparty = require('multiparty');
const fs = require('fs');
  
// routes
router.post('/upload', authorize(), upload);
router.get('/:id', authorize(), getById);
router.get('/all', authorize(), getAll);
router.get('/access/:id', authorize(), accessById);
router.get('/owned', authorize(), getOwned);


module.exports = router;

function upload(req, res, next) {
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
            const fileName = file.originalFilename;
            const userId = req.user.id;

            const data = await filesService.upload(buffer, fileName, type, userId);
            return res.status(200).send(data);
        } catch (err) {
            console.log('err :>> ', err);
            return res.status(500).send(err);
        }
    });
}

function getAll(req, res, next) {
    filesService.getAll()
        .then(files => res.json(files))
        .catch(next);
}

function getById(req, res, next) {
    filesService.getById(req.params.id)
        .then(file => res.json(file))
        .catch(next);
}

function accessById(req, res, next) {
    filesService.accessById(req.user, req.params.id)
        .then(file => res.json(file))
        .catch(next);
}