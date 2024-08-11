import express from "express";
import { S3 } from "aws-sdk";

const app = express();

const s3 = new S3({
    accessKeyId: "AKIA4MTWIHO73CCQCLXP",
    secretAccessKey: "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",
    endpoint: "https://s3.ap-south-1.amazonaws.com"
});

app.get("/*", async (req, res) => {
    const host  = req.hostname;
    const id = host.split(".")[0];
    const filePath = req.path;


    // lets say that the url from which we are hitting is id.vercel.com/asdasd
    // console.log(host); // id.vercel.com
    // console.log(id); // id
    // console.log(filePath); // /asdasd

    const contents = await s3.getObject({
        Bucket: "vercel-jayantgurushrivastava",
        Key: `dist/${id}${filePath}`
    }).promise();

    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"

    res.set("Content-Type", type);
    res.send(contents.Body);
});

app.listen(3001);