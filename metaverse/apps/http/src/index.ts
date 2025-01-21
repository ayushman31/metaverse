import express from "express";
import { router } from "./routes/v1/index.js";
import { userRouter } from "./routes/v1/user.js";
import { adminRouter } from "./routes/v1/admin.js";
import { spaceRouter } from "./routes/v1/space.js";
import {client} from "@repo/db/client";

const app = express();
app.use(express.json());


app.use("/api/v1" , router);


app.listen(process.env.PORT || 3000);