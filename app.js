// Express
import express from "express";
const app = express();
import "express-async-errors";

// import multer from "multer";
// const upload = multer();
// app.use(upload.array("product-images"));

// Express async errors
// Error handler
import { errorHandler } from "./middlewares/errorHandler.js";

//Path
import path from "path";

// dotenv
import dotenv from "dotenv";
dotenv.config();

// Cors
import cors from "cors";

// cookie parser
import cookieParser from "cookie-parser";

// Cookie parse
app.use(cookieParser());

// Parse json
app.use(express.json());

//Setting up cors
app.use(cors());

// Morgan
import morgan from "morgan";
import { authMiddleware } from "./middlewares/authMiddleware.js";
app.use(morgan("dev"));

// __dirname
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// public static
app.use(express.static("public"));

// Routes import
import authRoute from "./routes/auth.js";
import guruRoute from "./routes/guru.js";
import siswaRoute from "./routes/siswa.js";
import penjemputRoute from "./routes/penjemput.js";
import kelasRoute from "./routes/kelas.js";
// routes
const api = express.Router();
api.use("/auth", authRoute);
api.use("/guru", guruRoute);
api.use("/siswa", siswaRoute);
api.use("/penjemput", penjemputRoute);
api.use("/kelas", kelasRoute);

app.use("/api/v1", api);

//Error handling
app.use(errorHandler);

// Run the server
const PORT = 5000;
const HOST = "127.0.0.1";
app.listen(PORT, HOST, () => {
  try {
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.log("Failed");
  }
});
