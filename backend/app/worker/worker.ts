import { workerData } from "worker_threads";

const { Worker } = require("worker_threads");

export function createWorker(script: string, data: any) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(script, { workerData: data });
        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code: number) => {
            if (code !== 0) {
                reject(new Error(`${code}`))
            }
        });
    });
}
