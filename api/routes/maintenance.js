const express = require("express");
const router = express.Router();

const MAINTENANCE_SECRET = process.env.MAINTENANCE_SECRET;

// A simple middleware to protect these endpoints
const checkAuth = (req, res, next) => {
	// Check for the secret in a header
	const secret = req.headers["x-maintenance-secret"];
	if (secret === MAINTENANCE_SECRET) {
		next(); // Secret is correct, proceed
	} else {
		// Wrong or missing secret
		res.status(401).json({ error: "Unauthorized" });
	}
};

// --- Endpoint 1: Turn Maintenance Mode ON ---
// health_check.py will call this on failure
router.post("/on", checkAuth, (req, res) => {
	// 'app.set' is the Express-way to set a global variable
	req.app.set("maintenance_mode", true);
	console.log("MAINTENANCE MODE: ENABLED");
	res.status(200).json({ status: "maintenance_mode_enabled" });
});

// --- Endpoint 2: Turn Maintenance Mode OFF ---
// health_check.py can call this on success
router.post("/off", checkAuth, (req, res) => {
	req.app.set("maintenance_mode", false);
	console.log("MAINTENANCE MODE: DISABLED");
	res.status(200).json({ status: "maintenance_mode_disabled" });
});

module.exports = router;
