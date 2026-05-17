import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" })); // 10mb for base64 CV uploads
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
