const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const filesService = require('./files.service');
// const fileType = require('file-type');
const multiparty = require('multiparty');
const fs = require('fs');
  
// routes
router.post('/', upload);

module.exports = router;

function upload(req, res, next) {
    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
        console.log('inside form.parse');
        if (error) {
            console.log('error 43 :>> ', error);
            return res.status(500).send(error);
        };

        try {
            console.log('files :>> ', files);
            const path = files.file[0].path;
            console.log('path :>> ', path);
            const buffer = fs.readFileSync(path);
            /**
             * Import 'file-type' ES-Module in CommonJS Node.js module
            */
            const { fileTypeFromBuffer } = await (eval('import("file-type")'));
            const type = await fileTypeFromBuffer(buffer);
            console.log(type);
            // const type = await FileType.fromBuffer(buffer);
            const fileName = `test/${Date.now().toString()}`;
            const data = await filesService.upload(buffer, fileName, type);
            return res.status(200).send(data);
        } catch (err) {
            console.log('err 59 :>> ', err);
            return res.status(500).send(err);
        }
    });
}