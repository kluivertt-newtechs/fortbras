import { Column, DataType, Model, Table } from "sequelize-typescript";

// Define the table definition interface
export interface FieldDefinition {
    type: any;
    allowNull?: boolean;
    primaryKey?: boolean;
    autoIncrement?: boolean;
    unique?: boolean;
}

export interface TableDefinition {
    name: string;
    fields: {
        [key: string]: FieldDefinition;
    };
}

export const setFieldType = (type: string) => {
    switch (type) {
        case "string":
            return DataType.STRING;
        case "text":
            return DataType.TEXT;
        case "number":
            return DataType.INTEGER;
        case "float":
            return DataType.FLOAT;
        case "boolean":
            return DataType.BOOLEAN;
        case "date":
            return DataType.DATEONLY;
        case "dateTime":
            return DataType.DATE;
        case "uuid":
            return DataType.UUID;
        case "json":
            return DataType.JSON;
        default:
            return DataType.STRING;
    }
};
