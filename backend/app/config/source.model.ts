import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

export class Source extends Model { }

Source.init(
    {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
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
        status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        modelName: "Source",
        tableName: "source",
        paranoid: false,
    }
);
