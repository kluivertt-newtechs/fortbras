import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

export class Queue extends Model {}

Queue.init(
  {
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dict: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    tabela: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    diff: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Queue",
    tableName: "queue",
    paranoid: false,
  }
);
