import express from "express";
import { router } from "./routes/v1";
import { userRouter } from "./routes/v1/user";
import { adminRouter } from "./routes/v1/admin";
import { spaceRouter } from "./routes/v1/space";
import client from "@repo/db/client";

const app = express();

app.use("/api/v1" , router);
app.use("api/v1/user" , userRouter );
app.use("api/v1/admin" , adminRouter);
app.use("api/v1/space" , spaceRouter);

app.listen(process.env.PORT || 3000);