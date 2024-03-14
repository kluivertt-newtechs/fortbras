import { Queue } from "./queue.model";

export function bootstrap() {

    console.log("Iniciando loaders...");
    setInterval(() => {
        const { exec } = require('node:child_process');
        const { cwd } = require('node:process');

        try {
            let ls: any;
            if (process.platform === "win32") {
                ls = exec(`${cwd()}\\loader.exe`);
            } else {
                ls = exec(`${cwd()}/loader.bin`);
            }

            ls.stdout.on('data', (data: any) => {
                console.log(`stdout: ${data}`);
            });

            ls.stderr.on('data', (data: any) => {
                console.error(`stderr: ${data}`);
            });

            ls.on("close", (code: any) => {
            });
        } catch (e) {

        }
    }, 10000);

}
