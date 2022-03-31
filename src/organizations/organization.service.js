const db = require('../_helpers/db');

module.exports = {
    create,
    getAll,
};

async function create(params) {
    await db.Organization.create(params);
}

async function getAll() {
    return await db.Organization.findAll();
}