import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
    accessKeyId: "AKIA4MTWIHO73CCQCLXP",
    secretAccessKey: "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",
    endpoint: "https://s3.ap-south-1.amazonaws.com"
})

// fileName => output/12312/src/App.tsx
// filepath => /Users/harkiratsingh/vercel/dist/output/12312/src/App.tsx

export async function uploadFile(fileName: string, localFilePath: string){
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel-jayantgurushrivastava",
        Key: fileName
    }).promise();
    console.log(response);
}