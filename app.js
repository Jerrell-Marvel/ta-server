// Express
import express from "express";
const app = express();

// import multer from "multer";
// const upload = multer();
// app.use(upload.array("product-images"));

// Express async errors
import "express-async-errors";

//axios
import axios from "axios";

// Error handler
import { errorHandler } from "./middleware/errorHandler.js";

//Path
import path from "path";

// dotenv
import dotenv from "dotenv";
dotenv.config();

// Cors
import cors from "cors";

// cookie parser
import cookieParser from "cookie-parser";

// Routes import

// Cookie parse
app.use(cookieParser());

// Parse json
app.use(express.json());

//Setting up cors
app.use(cors());

// Morgan
import morgan from "morgan";
import { authMiddleware } from "./middleware/authMiddleware.js";
app.use(morgan("dev"));

// __dirname
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// routes

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
