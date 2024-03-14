import { sequelize } from "../config/db";
import { Queue } from "../config/queue.model";

function formatarData(data: Date) {
    // Certifique-se de que a entrada seja um objeto Date
    if (!(data instanceof Date)) {
        console.error('A entrada deve ser um objeto Date.');
        return;
    }

    // Obtém os componentes da data
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    // Monta a string formatada
    const dataFormatada = `${dia}/${mes}/${ano} - ${horas}:${minutos}`;

    return dataFormatada;
}

export class DictWorker {

    unzip(uid: string, dict: number, filePath: string) {
        const unzipper = require("unzipper");
        const fs = require('node:fs');
        const fsp = require('node:fs/promises');
        const os = require('node:os');
        const etl = require("etl");

        const label = formatarData(new Date());

        fs.createReadStream(filePath)
            .pipe(unzipper.Parse())
            .pipe(etl.map(async (entry: any) => {
                if (entry.type == "File") {
                    try {
                        const buffer = await entry.buffer();
                        const tableName = (entry.path).split("/")[1].split(".")[0];
                        await fsp.writeFile(`${os.tmpdir()}/${tableName}_${dict}_${uid}.dat`, buffer);
                        const r = await Queue.findOne({
                            where: { uuid: uid, dict: dict, tabela: tableName }

                        });

                        if (!r) {
                            console.log(tableName);
                            await Queue.create({
                                uuid: uid,
                                label: label,
                                dict: dict,
                                tabela: tableName,
                                message: ""
                            });
                        }
                    } catch (ex) {
                        console.error(ex);
                    }
                }
                else {
                    entry.autodrain();
                }
            }))
            .promise()
            .then(() => {
            });
    }
}

export function createWorker(uuid: string, tableName: string, dict: number): Promise<void> {

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const fs = require('node:fs');
    const os = require('node:os');
    const csv = require("csv-parser");

    let modelCreated = false;
    let content: any[] = [];

    return new Promise((resolve, reject) => {
        console.log(`Processamento da tabela ${tableName} iniciado.`);

        fs.createReadStream(`${os.tmpdir()}/${tableName}_${dict}.dat`)
            .pipe(csv({ separator: ";" }))
            .on("data", (row: any) => {
                content.push(row); // TODO: A criação do registro deve ser feita aqui

                if (content.length === 2000) {

                    const data = content.map((x) => x);

                    Promise.resolve()
                        .then(() => {
                            if (!modelCreated) {
                                let queryCreate = `CREATE TABLE IF NOT EXISTS ${tableName} ( 
                        id SERIAL PRIMARY KEY,
                        uuid VARCHAR(36) NOT NULL,
                        dict INT NOT NULL`
                                for (const f of Object.keys(data[0])) {
                                    if (f.trim().length === 0) continue;
                                    if (f == "id" || f == "uuid" || f == "dict" || f == "type" || f == "d_e_l_e_t_" || f == "r_e_c_n_o_" || f == "r_e_c_d_e_l_" || f == "created_at" || f == "updated_at" || f == "deleted_at") {
                                        continue;
                                    }
                                    queryCreate += `, ${f.toLowerCase().replace("﻿", "")} VARCHAR`
                                }
                                queryCreate += `)`;
                                return sequelize.query(queryCreate, { raw: true });
                            }
                        })
                        .then(() => {
                            let queryIndex = `create index if not exists ${tableName}_diff_perf on ${tableName} using btree (uuid,dict`;
                            let count = 0;
                            for (const f of Object.keys(data[0])) {
                                if (f.trim().length === 0) continue;

                                if (f == "id" || f == "uuid" || f == "dict" || f == "type" || f == "d_e_l_e_t_" || f == "r_e_c_n_o_" || f == "r_e_c_d_e_l_" || f == "created_at" || f == "updated_at" || f == "deleted_at") {
                                    continue;
                                }

                                // Índice não pode ter mais que 32 colunas
                                if (count == 30) {
                                    break;
                                }

                                queryIndex += `, (md5(upper(${f.toLowerCase().replace("﻿", "")})))`

                                count++;
                            }
                            queryIndex += `)`;
                            return sequelize.query(queryIndex, { raw: true });
                        })
                        .then(() => { modelCreated = true; return sleep(300) })
                        .then(() => {

                            let queryInsert = `INSERT INTO ${tableName} (uuid, dict`;
                            for (const f of Object.keys(data[0])) {
                                if (f.trim().length === 0) continue;
                                queryInsert += `, ${f.toLowerCase().replace("﻿", "")}`
                            }
                            queryInsert += `) VALUES `;
                            for (let reg of data) {
                                queryInsert += `('${uuid}', ${dict} `;

                                for (const f of Object.keys(reg)) {
                                    if (f.trim().length === 0) continue;
                                    queryInsert += `, E'${reg[f].trim().replaceAll("\\", "\\\\").replaceAll("'", "\\'") || ''}'`
                                }
                                queryInsert += `),`;
                            }

                            queryInsert = queryInsert.substring(0, queryInsert.length - 1) + ";";

                            // sequelize.transaction().then((t: any) => {
                            sequelize.query(queryInsert).then(() => {
                                // t.commit();
                            }).catch((e: any) => {
                                throw e;
                            });
                            // });
                        })
                        .catch((ex: any) => reject(ex));


                    content = [];
                }
            })
            .on('end', () => {

                if (content.length > 0) {

                    let queryInsert = `INSERT INTO ${tableName} (uuid, dict`;
                    for (const f of Object.keys(content[0])) {
                        if (f.trim().length === 0) continue;
                        queryInsert += `, ${f.toLowerCase().replace("﻿", "")}`
                    }
                    queryInsert += `) VALUES `;
                    for (let reg of content) {
                        queryInsert += `('${uuid}', ${dict} `;

                        for (const f of Object.keys(reg)) {
                            if (f.trim().length === 0) continue;
                            queryInsert += `, E'${reg[f].trim().replace("'", "\\'")}'`
                        }
                        queryInsert += `),`;
                    }

                    queryInsert = queryInsert.substring(0, queryInsert.length - 1) + ";";

                    // sequelize.transaction().then((t: any) => {
                    sequelize.query(queryInsert).then(() => {
                        // t.commit();
                    }).catch((e: any) => {
                        reject(e)
                    });
                    // });

                    content = [];
                }

                resolve();

            });
    });

}

async function parseData(content: any[], uuid: string, dict: number): Promise<any[]> {

    return new Promise((resolve, reject) => {
        const data: any[] = [];
        for (let r of content) {
            const v: any = {};
            for (let k of Object.keys(r)) {
                v[k.toLowerCase()] = r[k];
            }
            v["uuid"] = uuid;
            v["dict"] = dict;
            data.push(v)
        }
        resolve(data);
    });

}
