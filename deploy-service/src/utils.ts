import { exec } from "child_process";
import path from "path";

export function buildProject(id: string) {
    return new Promise((resolve) => {
        const child = exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install && npm run build`)

        // The below two functions are written for logging the logs that the child process is giving
        child.stdout?.on('data', function(data) {
            console.log('stdout: ', data);
        });

        child.stderr?.on('data', (data) => {
            console.log('stderr: ', data);    
        });

        child.on('close', (code) => {
            resolve("")
        });
    });

}