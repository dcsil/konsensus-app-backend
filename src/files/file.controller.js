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
router.put('/star/:id', authorize(), star);
router.put('/:id', authorize(), reupload);
router.get('/owned', authorize(), getOwnedFiles);
router.get('/starred', authorize(), getStarredFiles);
router.get('/recent', authorize(), getRecentFiles);
router.get('/all', authorize(), getAll);
router.get('/access/:id', authorize(), accessById);
router.get('/:id', authorize(), getById);

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
            console.log(err);
            return res.status(500).send(err);
        }
    });
}

function reupload(req, res, next) {
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
            const fileId = req.params.id;

            const data = await filesService.reupload(buffer, fileName, type, fileId, userId);
            return res.status(200).send(data);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    });
}

function star(req, res, next) {
    filesService.star(req.user, req.params.id)
        .then((message) => res.json({message: message}))
        .catch(next);
}

function getAll(req, res, next) {
    filesService.getAll(req.user.id)
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

function getOwnedFiles(req, res, next) {
    filesService.getOwnedFiles(req.user)
        .then(files => res.json(files))
        .catch(next);
}

function getStarredFiles(req, res, next) {
    filesService.getStarredFiles(req.user)
        .then(files => res.json(files))
        .catch(next);
}

function getRecentFiles(req, res, next) {
    filesService.getRecentFiles(req.user)
        .then(files => res.json(files))
        .catch(next);
}