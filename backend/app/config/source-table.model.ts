import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import { Source } from './source.model';

export class SourceTable extends Model {}

SourceTable.init(
    {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'SourceTable',
        tableName: 'source_table',
        paranoid: false,
    },
);

export class SourceTableField extends Model {}

SourceTableField.init(
    {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'SourceTableField',
        tableName: 'source_table_field',
        paranoid: false,
    },
);

SourceTable.belongsTo(Source);
Source.hasMany(SourceTable, { onDelete: 'CASCADE' });

SourceTableField.belongsTo(SourceTable);
SourceTable.hasMany(SourceTableField, { onDelete: 'CASCADE' });
