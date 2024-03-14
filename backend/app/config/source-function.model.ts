import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import { Source } from './source.model';

export class SourceFunction extends Model {}

SourceFunction.init(
    {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        source: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'SourceFunction',
        tableName: 'source_function',
        paranoid: false,
    },
);

SourceFunction.belongsTo(Source);
Source.hasMany(SourceFunction, { onDelete: 'CASCADE' });
