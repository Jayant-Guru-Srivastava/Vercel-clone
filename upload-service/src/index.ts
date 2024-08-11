import express from "express";
import cors from "cors"
import {generate} from "./utils";
import simpleGit from "simple-git";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { createClient } from "redis";

const app = express();

app.use(cors());
app.use(express.json());

const publisher = createClient();
const subscriber = createClient();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    files.forEach(async file => {
        await uploadFile(file.slice(__dirname.length + 1), file);  // This is correct
        // await uploadFile(`output/${id}`, file);  // This is wrong because it will upload all the files in the same folder
    });

    await publisher.lPush("build-queue", id);

    await publisher.hSet("status", id, "uploaded");
    // To get the status of the build, you can use the following command:
    // const value = await publisher.hGet("status", id);

    res.json({
        id: id
    });
});

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);

    res.json({
        status: response
    })
})

async function startServer(){
    try{
        await publisher.connect();
        await subscriber.connect();
        console.log("Redis client connected");

        app.listen(3000);
    } catch(e) {
        console.log("Error connecting to redis client")
    }
}

startServer();