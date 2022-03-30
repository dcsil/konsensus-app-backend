const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        fileId: { 
            type: DataTypes.UUID, 
            allowNull: false,
            references: {
                model: 'Files',
                key: 'id',
            },
            primaryKey: true },
        userId: { 
            type: DataTypes.UUID, 
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            primaryKey: true },
        canView: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
        canEdit: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
        canShare: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
        isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    };

    const options = {
    };

    return sequelize.define('Permission', attributes, options);
}