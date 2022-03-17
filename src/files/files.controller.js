const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const filesService = require('./files.service');

// routes
router.post('/', upload);

module.exports = router;

function uploadSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function upload(req, res, next) {
    // filesService.upload(req.body)
    //     .then(user => res.json(user))
    //     .catch(next);

    const form = new multiparty.Form();
    form.parse(request, async (error, fields, files) => {
        if (error) {
            return response.status(500).send(error);
        };

        try {
            const path = files.file[0].path;
            const buffer = fs.readFileSync(path);
            const type = await FileType.fromBuffer(buffer);
            const fileName = `test/${Date.now().toString()}`;
            const data = await filesService.upload(buffer, fileName, type);
            return response.status(200).send(data);
        } catch (err) {
            return response.status(500).send(err);
        }
    });
}