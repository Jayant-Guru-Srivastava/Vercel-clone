import { commandOptions, createClient } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
const publisher = createClient();

async function main(){
    while(true){
        const response = await subscriber.brPop(
            commandOptions({ isolated: true }),
            'build-queue',
            0
        );

        const id = response?.element
        if(id){
            await downloadS3Folder(`output/${id}`);
            await buildProject(id);
            await copyFinalDist(id);
            await publisher.hSet("status", id, "deployed");
        }
    }
}

async function startServer(){
    try{
        await subscriber.connect();
        await publisher.connect();
        console.log("Redis client connected");

    } catch(e) {
        console.log("Error connecting to redis client")
    }
}

startServer();
main();