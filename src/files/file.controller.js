const express = require('express');
const router = express.Router();
const authorize = require('../_middleware/authorize')
const filesService = require('./file.service');
const multiparty = require('multiparty');
  
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
            const userId = req.user.id;
            console.log(file)

            const data = await filesService.upload(file, userId);
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
            const userId = req.user.id;
            const fileId = req.params.id;

            const data = await filesService.reupload(file, fileId, userId);
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
    filesService.getById(req.user, req.params.id)
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