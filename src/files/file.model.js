const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: { 
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: true },
        size: { type: DataTypes.INTEGER, allowNull: true },
        lastUpdater: { 
            type: DataTypes.UUID,
            references: {
                model: 'Users',
                key: 'id',
            },
            allowNull: false 
    },
    };

    const options = {
    };

    return sequelize.define('File', attributes, options);
}