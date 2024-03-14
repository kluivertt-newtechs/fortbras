import { sequelize } from './app/config/db';
import * as pathlib from 'path';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

require('dotenv').config();

let data: any = null;

(async () => {
    const fs = require('node:fs');
    const os = require('node:os');
    const csv = require('csv-parser');

    let queryAtivo = `SELECT COUNT(*) as cnt FROM queue WHERE status = 2`;
    const results: any = await sequelize.query(queryAtivo);
    if (results[0][0].cnt === '0') {
        data = null;
        let queryPendente = `SELECT * FROM queue WHERE status = 0 order by tabela, dict LIMIT 1`;
        const resultsPend = await sequelize.query(queryPendente);
        if (resultsPend && resultsPend[0] && resultsPend[0][0]) {
            data = resultsPend[0][0];
            if (data) {
                console.log(
                    `Processando tabela ${data.tabela} do dicionário ${data.dict}`,
                );
                let updatePendente = `UPDATE queue SET status = 2 WHERE id = ${data.id}`;
                await sequelize.query(updatePendente);
            }
        }
    }

    if (data) {
        try {
            const _row = await _parseTable(data);
            await _createTable(data, _row);

            let content: any[] = [];
            fs.createReadStream(
                `${os.tmpdir()}${pathlib.sep}${data.tabela}_${data.dict}_${
                    data.uuid
                }.dat`,
            )
                .pipe(csv({ separator: ';' }))
                .on('data', (row: any) => {
                    content.push(row);

                    // Insere os registros em lotes de 1000
                    if (content.length === 1000) {
                        const dataTable = content.map((x) => x);

                        _insertRows(data, dataTable).catch((ex: any) => {
                            throw ex;
                        });

                        content = [];
                    }
                })
                .on('end', () => {
                    // Insere os registros restantes e marca a tabela como finalizada
                    if (content.length > 0) {
                        _insertRows(data, content).then(() => {
                            let updatePendente = `SET statement_timeout=3600000; SET idle_in_transaction_session_timeout=3600000;UPDATE queue SET status = 1 WHERE id = ${data.id}`;
                            sequelize.query(updatePendente).then(() => {
                                console.log(
                                    `Finalizando tabela ${data.tabela} do dicionário ${data.dict}`,
                                );
                            });
                        });
                    }
                });
        } catch (ex) {
            let deleteQuery = `DELETE from ${data.tabela} WHERE uuid = '${data.uuid}' AND dict = ${data.dict}`;
            await sequelize.query(deleteQuery);
            let updatePendente = `UPDATE queue SET status = 0 WHERE id = ${data.id}`;
            await sequelize.query(updatePendente).then(() => {});
        }
    }
})();

function _parseTable(data: any): Promise<any> {
    const fs = require('node:fs');
    const os = require('node:os');
    const csv = require('csv-parser');

    return new Promise((resolve, reject) => {
        fs.createReadStream(
            `${os.tmpdir()}/${data.tabela}_${data.dict}_${data.uuid}.dat`,
        )
            .pipe(csv({ separator: ';' }))
            .on('data', (row: any) => {
                resolve(row);
            });
    });
}
async function _createTable(data: any, dataTable: any): Promise<any> {
    const queryExists = `SELECT COUNT(*) as cnt FROM pg_tables WHERE tablename = '${data.tabela}'`;
    const results: any = await sequelize.query(queryExists);

    if (results[0][0].cnt === '0') {
        try {
            console.log(`Criando tabela ${data.tabela}`);
            let queryCreate = `CREATE TABLE IF NOT EXISTS ${data.tabela} (
                                id SERIAL PRIMARY KEY,
                                uuid VARCHAR(36) NOT NULL,
                                dict INT NOT NULL,
                                diff INT`;
            for (const f of Object.keys(dataTable)) {
                if (f.trim().length === 0) continue;
                if (
                    f == 'id' ||
                    f == 'uuid' ||
                    f == 'dict' ||
                    f == 'type' ||
                    f == 'd_e_l_e_t_' ||
                    f == 'r_e_c_n_o_' ||
                    f == 'r_e_c_d_e_l_' ||
                    f == 'created_at' ||
                    f == 'updated_at' ||
                    f == 'deleted_at'
                ) {
                    continue;
                }
                queryCreate += `, ${f.toLowerCase().replace('﻿', '')} VARCHAR`;
            }
            queryCreate += `)`;
            await sequelize.query(queryCreate, { raw: true });
            await sleep(500);
        } catch (ex) {
            console.error(ex);
            throw ex;
        }

        try {
            console.log(`Criando índices`);
            let queryIndex = `create index if not exists ${data.tabela}_diff_perf on ${data.tabela} using btree (uuid,dict`;
            let count = 0;
            for (const f of Object.keys(dataTable)) {
                if (f.trim().length === 0) continue;

                if (
                    f == 'id' ||
                    f == 'uuid' ||
                    f == 'dict' ||
                    f == 'diff' ||
                    f == 'type' ||
                    f == 'd_e_l_e_t_' ||
                    f == 'r_e_c_n_o_' ||
                    f == 'r_e_c_d_e_l_' ||
                    f == 'created_at' ||
                    f == 'updated_at' ||
                    f == 'deleted_at'
                ) {
                    continue;
                }

                // Índice não pode ter mais que 32 colunas
                if (count == 30) {
                    break;
                }

                queryIndex += `, (md5(upper(${f
                    .toLowerCase()
                    .replace('﻿', '')})))`;

                count++;
            }
            queryIndex += `)`;
            await sequelize.query(queryIndex, { raw: true });
        } catch (ex) {
            throw ex;
        }
    }
}

function _insertRows(data: any, dataTable: any): Promise<any> {
    return new Promise((resolve, reject) => {
        let queryInsert = `SET statement_timeout=300000; SET idle_in_transaction_session_timeout=300000;INSERT INTO ${data.tabela} (uuid, dict`;
        for (const f of Object.keys(dataTable[0])) {
            if (f.trim().length === 0) continue;
            queryInsert += `, ${f.toLowerCase().replace('﻿', '')}`;
        }
        queryInsert += `) VALUES `;
        for (let reg of dataTable) {
            queryInsert += `('${data.uuid}', ${data.dict} `;

            for (const f of Object.keys(reg)) {
                if (f.trim().length === 0) continue;
                queryInsert += `, E'${
                    reg[f]
                        .trim()
                        .replaceAll('\\', '\\\\')
                        .replaceAll("'", "\\'") || ''
                }'`;
            }
            queryInsert += `),`;
        }

        queryInsert = queryInsert.substring(0, queryInsert.length - 1) + ';';

        sequelize
            .query(queryInsert)
            .then(() => {
                resolve({});
            })
            .catch((e: any) => {
                reject(e);
            });
    });
}
