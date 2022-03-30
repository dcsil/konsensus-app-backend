const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: { 
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        organizationId: { 
            type: DataTypes.UUID, 
            references: {
                model: 'Organizations',
                key: 'id',
            },
            allowNull: false 
        },
        role: {
            type: DataTypes.ENUM('admin', 'member'), 
            defaultValue: 'member',
            allowNull: false
        },
        image: { type: DataTypes.UUID, allowNull: true },
        ownedFiles: { 
            type: DataTypes.JSON,
            defaultValue: [],
            allowNull: true 
        },
        starredFiles: { 
            type: DataTypes.JSON,
            defaultValue: [],
            allowNull: true 
        },
        recentFiles: { 
            type: DataTypes.JSON,
            defaultValue: [],
            allowNull: true 
        },
        hash: { type: DataTypes.STRING, allowNull: false }
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: ['hash'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('User', attributes, options);
}