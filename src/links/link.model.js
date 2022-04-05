const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        shareToken: { 
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true 
        },
        fileId: { 
            type: DataTypes.UUID, 
            allowNull: false,
            references: {
                model: 'Files',
                key: 'id',
            },
        },
        sharerId: { 
            type: DataTypes.UUID, 
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
        },
        email: { type: DataTypes.STRING, allowNull: false },
    };

    const options = {
    };

    return sequelize.define('Link', attributes, options);
}