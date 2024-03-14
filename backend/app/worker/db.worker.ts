import { workerData, parentPort } from "worker_threads";
import { sequelize } from "../config/db";
import { TableDefinition, setFieldType } from "../config/table-definition.model";
import { createModel } from "../config/table-model";

const tableName = workerData.tableName;
const tableData = workerData.tableData;

// console.dir(name.split("/")[1].split(".")[0]);
const td: TableDefinition = {
    // name: name.split("/")[1].split(".")[0],
    name: tableName,
    fields: {
        uuid: { type: "varchar", allowNull: false, unique: false },
        type: { type: "int", allowNull: false, unique: false }
    },
};

const fields = Object.keys(tableData[0]);
for (const f of fields) {
    if (f.trim().length === 0) continue;

    // if (f == 'D_E_L_E_T_' || f == 'R_E_C_N_O_' || f == 'R_E_C_D_E_L_') continue;

    if (td.fields) {
        td.fields[f.toLowerCase()] = {
            type: "varchar",
            allowNull: true,
            unique: false,
        };
    }
}

// console.dir(td);

const DynamicModel = createModel(sequelize, td);
DynamicModel.sync();
DynamicModel.bulkCreate(tableData);

/* for (let r of tableData) {
    const v: any = {};
    for (let k of Object.keys(r)) {
        v[k.toLowerCase()] = r[k];
    }
    DynamicModel.create(v);
} */

parentPort?.postMessage({});
