const db = require('../_helpers/db');

module.exports = {
    create,
    getAll,
};

async function create(params) {
    const org = await db.Organization.create(params);
    return org.id;
}

async function getAll() {
    return await db.Organization.findAll();
}