import { Model, Sequelize, Table } from "sequelize-typescript";
import { TableDefinition } from "./table-definition.model";

// Define the dynamic model function
export function createModel(sequelize: Sequelize, tableDef: TableDefinition) {
    // Define the model class dynamically
    @Table({ tableName: tableDef.name })
    class DynamicTable extends Model {
        //public id!: number;

        constructor(values?: { [key: string]: any }, options?: any) {
            super(values, options);
        }
    }

    // Define the table fields dynamically
    const fields: any = {};
    for (const fieldName in tableDef.fields) {
        const fieldDef = tableDef.fields[fieldName];
        fields[fieldName] = {
            type: fieldDef.type,
            allowNull: fieldDef.allowNull || true,
            unique: fieldDef.unique || false,
            primaryKey: fieldDef.primaryKey || false,
            autoIncrement: fieldDef.autoIncrement || false,
        };
    }

    // Define the model options
    const options = {
        sequelize,
        modelName: tableDef.name,
        tableName: tableDef.name,
        timestamps: true,
        underscored: true,
        paranoid: true,
    };

    sequelize.addModels([DynamicTable]);

    // Initialize the model
    DynamicTable.init(fields, options);

    return DynamicTable;
}
