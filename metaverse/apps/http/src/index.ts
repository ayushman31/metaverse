import express from "express";
import { router } from "./routes/v1/index.js";
import { userRouter } from "./routes/v1/user.js";
import { adminRouter } from "./routes/v1/admin.js";
import { spaceRouter } from "./routes/v1/space.js";
import {client} from "@repo/db/client";

const app = express();

app.use("/api/v1" , router);
app.use("/api/v1/user" , userRouter );
app.use("/api/v1/admin" , adminRouter);
app.use("/api/v1/space" , spaceRouter);

app.listen(process.env.PORT || 3000);