require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jobRoutes = require("./routes/jobs");
const maintenanceRoutes = require("./routes/maintenance");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.set("maintenance_mode", false);

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/jobs", jobRoutes);
app.use("/api/maintenance", maintenanceRoutes);

app.get("/", (req, res) => {
	res.send("Job Scraper API is running");
});
mongoose
	.connect(MONGO_URI)
	.then(() => {
		console.log("Connected to MongoDB");
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Failed to connect to MongoDB", err);
	});
