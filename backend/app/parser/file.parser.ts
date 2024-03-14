import * as fs from 'fs/promises';
import * as pathlib from 'path';
import { Source } from '../config/source.model';
import { SourceFunction } from '../config/source-function.model';
import { formatarData } from '../utils/utils';
import { SourceTable, SourceTableField } from '../config/source-table.model';

export interface Program {
    category: string;
    source?: string;
    functions: Function[];
    tables: Table[];
}

export interface Function {
    type: string;
    name: string;
    body: string[];
}

export interface Table {
    name: string;
    fields: string[];
}

const peValues: any = [];

export async function unzip(uid: string, filePath: string) {
    const unzipper = require('unzipper');
    const fs = require('node:fs');
    const fsp = require('node:fs/promises');
    const os = require('node:os');
    const etl = require('etl');

    fs.createReadStream(filePath)
        .pipe(unzipper.Parse())
        .pipe(
            etl.map(async (entry: any) => {
                if (entry.type == 'File') {
                    try {
                        const buffer = await entry.buffer();
                        const filename = pathlib.basename(entry.path);
                        const fileext = pathlib
                            .extname(entry.path)
                            .toLowerCase();

                        if (
                            fileext == '.prw' ||
                            fileext == '.prx' ||
                            fileext == '.tlpp'
                        ) {
                            fs.access('tmp/', (error: any) => {
                                if (error) {
                                    fs.mkdirSync('tmp/');
                                }
                            });

                            const outfile = `tmp/${filename}_${uid}.dat`;
                            await fsp.writeFile(outfile, buffer);

                            try {
                                const result: Program =
                                    await parseFile(outfile);

                                const dbuid = await Source.findOne({});
                                const uuid = dbuid?.get('uuid') || uid;

                                const r = await Source.findOne({
                                    where: {
                                        uuid: uuid,
                                        name: filename,
                                    },
                                });

                                if (r && r.get('category') != result.category) {
                                    console.log(
                                        `${filename} : ${r.get(
                                            'category',
                                        )} => ${result.category}`,
                                    );
                                }

                                if (r) {
                                    await Source.destroy({
                                        where: {
                                            uuid: uuid,
                                            name: filename,
                                        },
                                    });
                                }

                                const s: any = await Source.create({
                                    uuid: uuid,
                                    label: 'Documentação',
                                    category: result.category,
                                    name: filename,
                                    source: result.source,
                                });

                                for (const f of result.functions) {
                                    await SourceFunction.create({
                                        uuid: uuid,
                                        type: f.type,
                                        name: f.name,
                                        source: f.body.join('\n'),
                                        SourceId: s.id,
                                    });
                                }

                                for (const table of result.tables) {
                                    const t: any = await SourceTable.create({
                                        uuid: uuid,
                                        name: table.name,
                                        SourceId: s.id,
                                    });

                                    for (const field of table.fields) {
                                        await SourceTableField.create({
                                            uuid: uuid,
                                            name: field,
                                            SourceTableId: t.id,
                                        });
                                    }
                                }
                            } catch (ex) {
                                throw ex;
                            }
                        }
                    } catch (ex) {
                        console.error(ex);
                    }
                } else {
                    entry.autodrain();
                }
            }),
        )
        .promise()
        .then(() => {
            // peValues.splice(0, peValues.length);
            console.log('Processamento finalizado');
        });
}

async function _isPE(value: string) {
    if (peValues.length == 0) {
        const file = await fs.open('./values.txt', 'r');
        for await (const line of file.readLines()) {
            peValues.push(line);
        }
        // console.log('Valores carregados');
    }
    for (const v of peValues) {
        const regex = new RegExp(`${v.toUpperCase()}`, 'g');
        // console.log(regex, value, value.match(regex));
        if (value.toUpperCase().match(regex)) {
            // console.log(regex, value, value.match(regex));
            return true;
        }
    }

    return false;
}

async function parseFile(path: string) {
    const filename = pathlib.basename(path);

    let cat: string = '';

    switch (filename.substring(5, 5).toUpperCase()) {
        case 'C':
            cat = 'Cadastro';
            break;
        case 'P':
            cat = 'Processo';
            break;
        case 'R':
            cat = 'Relatório';
            break;
        case 'W':
            cat = 'Workflow e web service';
            break;
        default:
            cat = 'Não categorizado';
            break;
    }

    const program: Program = {
        category: cat,
        functions: [],
        tables: [],
    };

    let lines: string[] = [];
    try {
        const file = await fs.open(path, 'r');
        for await (const line of file.readLines()) {
            lines.push(line);
        }

        program.source = lines.join('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (
                line.toLowerCase().match('axcadastro') ||
                line.toLowerCase().match('axprocesso') ||
                line.toLowerCase().match('axworkflow') ||
                line.toLowerCase().match('mbrowse') ||
                line.toLowerCase().match('twbrowse') ||
                line.toLowerCase().match('msdialog') ||
                line.toLowerCase().match('markbrowse')
            ) {
                program.category = 'Cadastro';
            }

            if (
                line.toLowerCase().match('axrelatorio') ||
                line.toLowerCase().match('setprint') ||
                line.toLowerCase().match('printer') ||
                line.toLowerCase().match('treport')
            ) {
                program.category = 'Relatório';
            }

            if (line.toLowerCase().match('wsrestful')) {
                program.category = 'Web Service REST';
            }

            if (line.toLowerCase().match('wsservice')) {
                program.category = 'Web Service SOAP';
            }

            const tablesFound = _findTables(line);
            if (tablesFound) {
                for (const t of tablesFound.filter(
                    (item: any, index: number) =>
                        tablesFound.indexOf(item) === index,
                )) {
                    const table: Table = {
                        name: t,
                        fields: [],
                    };
                    program.tables.push(table);
                }
            }

            let fn = _findUserFunctions(line);
            if (fn) {
                const isPE = await _isPE(line);
                if (isPE) {
                    program.category = 'Ponto de entrada';
                }
                const f: Function = {
                    type: 'User',
                    name: fn[0],
                    body: [],
                };
                for (let j = i; j < lines.length; j++) {
                    const line2 = lines[j];
                    if (_findFunctionClose(line2)) {
                        f.body = lines.slice(i, j + 1);
                        program.functions.push(f);
                        break;
                    }
                }
            }
            fn = _findStaticFunctions(line);
            if (fn) {
                const f: Function = {
                    type: 'Static',
                    name: fn[0],
                    body: [],
                };
                for (let j = i; j < lines.length; j++) {
                    const line2 = lines[j];
                    if (_findFunctionClose(line2)) {
                        f.body = lines.slice(i, j + 1);
                        program.functions.push(f);
                        break;
                    }
                }
            }

            if (_findOpenClass(line)) {
                program.category = 'Classes';

                fn = _findClassMethods(line);
                if (fn) {
                    const f: Function = {
                        type: 'Method',
                        name: fn[0],
                        body: [],
                    };
                    for (let j = i; j < lines.length; j++) {
                        const line2 = lines[j];
                        if (_findFunctionClose(line2)) {
                            f.body = lines.slice(i, j + 1);
                            program.functions.push(f);
                            break;
                        }
                    }
                }
            }

            _findFields(program, line);
        }

        return program;
    } catch (ex) {
        console.error(ex);
        throw ex;
    }
}

function _findUserFunctions(text: string) {
    const pattern =
        /\b[uU][sS][eE][rR]\s+[fF][uU][nN][cC][tT][iI][oO][nN]\s+\w+\s*/g;
    const result = text.match(pattern);
    return result;
}

function _findStaticFunctions(text: string) {
    const pattern =
        /\b[sS][tT][aA][tT][iI][cC]\s+[fF][uU][nN][cC][tT][iI][oO][nN]\s+\w+\s*/g;
    const result = text.match(pattern);
    return result;
}

function _findFunctionClose(text: string) {
    const pattern = /^\b[rR][eE][tT][uU][rR][nN]\s*\w*\s*/g;
    const result = text.match(pattern);
    return result;
}

function _findOpenClass(text: string) {
    const pattern = /\b[cC][lL][aA][sS][sS]\s+\w+\s*/g;
    const result = text.match(pattern);
    return result;
}

function _findClassMethods(text: string) {
    const pattern = /\b[mM][eE][tT][hH][oO][dD]\s+\w*\s*\(\)/g;
    const result = text.match(pattern);
    return result;
}

function _findClassClose(text: string) {
    const pattern = /^\b[eE][nN][dD][cC][lL][aA][sS][sS]\s*\w*\s*/g;
    const result = text.match(pattern);
    return result;
}

function _findTables(text: string) {
    const res: any = [];

    const pattern = /retsqlname\(["']([^"']+)["']\)/;
    const result = text.toLowerCase().match(pattern);

    if (result) {
        res.push(result[1].toUpperCase());
    }

    const pattern2 = /setalias\(["']([^"']+)["']\)/;
    const result2 = text.toLowerCase().match(pattern2);

    if (result2) {
        res.push(result2[1].toUpperCase());
    }

    const pattern3 = /dbselectarea\(["']([^"']+)["']\)/;
    const result3 = text.toLowerCase().match(pattern3);

    if (result3) {
        res.push(result3[1].toUpperCase());
    }

    return res.filter(
        (item: any, index: number) => res.indexOf(item) === index,
    );
}

function _findFields(program: Program, text: string) {
    if (program && program.tables) {
        for (const t of program.tables) {
            const pattern2 = new RegExp(`${t.name.toLowerCase()}\_\\w*`, 'g');
            const result2 = text.toLowerCase().match(pattern2);
            if (result2) {
                for (const r of result2) {
                    t.fields.push(r.toUpperCase());
                }
            } else {
                const pattern = new RegExp(
                    `${t.name.substring(1).toLowerCase()}\_\\w*`,
                    'g',
                );
                const result = text.toLowerCase().match(pattern);
                if (result) {
                    for (const r of result) {
                        t.fields.push(r.toUpperCase());
                    }
                }
            }

            t.fields = t.fields.filter(
                (item: any, index: number) => t.fields.indexOf(item) === index,
            );
        }
    }
}

/* parseFile("/home/mantonelli/Sources/Clientes/Fortbrás/Fontes/COMP011_MVC.prw")
    .then(ret => console.log(ret)) */
