"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const utils_1 = require("./utils");
const simple_git_1 = __importDefault(require("simple-git"));
const path_1 = __importDefault(require("path"));
const file_1 = require("./file");
const aws_1 = require("./aws");
const redis_1 = require("redis");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const publisher = (0, redis_1.createClient)();
const subscriber = (0, redis_1.createClient)();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
app.post("/deploy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoUrl = req.body.repoUrl;
    const id = (0, utils_1.generate)();
    yield (0, simple_git_1.default)().clone(repoUrl, path_1.default.join(__dirname, `output/${id}`));
    const files = (0, file_1.getAllFiles)(path_1.default.join(__dirname, `output/${id}`));
    files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, aws_1.uploadFile)(file.slice(__dirname.length + 1), file); // This is correct
        // await uploadFile(`output/${id}`, file);  // This is wrong because it will upload all the files in the same folder
    }));
    yield publisher.lPush("build-queue", id);
    yield publisher.hSet("status", id, "uploaded");
    // To get the status of the build, you can use the following command:
    // const value = await publisher.hGet("status", id);
    res.json({
        id: id
    });
}));
app.get("/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const response = yield subscriber.hGet("status", id);
    res.json({
        status: response
    });
}));
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield publisher.connect();
            yield subscriber.connect();
            console.log("Redis client connected");
            app.listen(3000);
        }
        catch (e) {
            console.log("Error connecting to redis client");
        }
    });
}
startServer();
