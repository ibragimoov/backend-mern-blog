import express from "express";
import fs from "fs";
import multer from "multer";
const cors = require("cors");

import mongoose from "mongoose";

import {
    registerValidation,
    loginValidation,
    postCreateValidation,
} from "./validations.js";

import { handleValidationErrors, checkAuth } from "./utils/index.js";

import { UserController, PostController } from "./controllers/index.js";

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("DB ok"))
    .catch((err) => console.log("DB error", err));

const app = express();
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        if (!fs.existsSync("src/upload")) {
            fs.mkdirSync("src/upload");
        }
        cb(null, "src/upload");
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});
//
const upload = multer({ storage });

app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);
app.use("/upload", express.static("src/upload"));

app.post(
    "/auth/login",
    loginValidation,
    handleValidationErrors,
    UserController.login
);
app.post(
    "/auth/register",
    registerValidation,
    handleValidationErrors,
    UserController.register
);
app.get("/auth/me", checkAuth, UserController.getMe);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
    try {
        res.json({
            url: `/upload/${req.file.originalname}`,
        });
    } catch (error) {
        console.log(error);
    }
});

app.get("/tags", PostController.getLastTags);

app.get("/posts", PostController.getAll);
app.get("/posts/tags", PostController.getLastTags);
app.get("/posts/:id", PostController.getOne);
app.post(
    "/posts",
    checkAuth,
    postCreateValidation,
    handleValidationErrors,
    PostController.create
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
    "/posts/:id",
    checkAuth,
    postCreateValidation,
    handleValidationErrors,
    PostController.update
);

app.listen(process.env.PORT || 4444, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log("Server OK");
});
