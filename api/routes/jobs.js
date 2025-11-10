// api/routes/jobs.js
const express = require("express");
const router = express.Router();
const Job = require("../models/Job"); // Import the 'Job' model

router.post("/", async (req, res) => {
    // Maintenance check was correct
    if (req.app.get("maintenance_mode") === true) {
        return res.status(503).json({
            error: "Service is temporarily down for maintenance. Please try again later.",
        });
    }

    const { profile_url, user_email } = req.body;
    if (!profile_url || !user_email) {
        return res.status(400).json({ error: "profile_url and user_email are required" });
    }

    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // --- FIX: Use 'complete' (lowercase) ---
        // --- FIX: Check 'updatedAt' for caching ---
        const cachedJob = await Job.findOne({
            profile_url: profile_url,
            status: "complete", 
            updatedAt: { $gte: twentyFourHoursAgo }
        });
        
        if (cachedJob) {
            console.log("Returning cached job result for profile_url:", profile_url);
            
            // --- FIX: Send 'complete' as a string ---
            return res.status(200).json({
                message: "Job completed (from cache)",
                result_id: cachedJob.result_id,
                status: "complete", 
            });
        }

        console.log("Creating new job for profile_url:", profile_url);
        const newJob = new Job({
            profile_url,
            user_email,
            status: "pending",
        });
        await newJob.save();

        return res.status(201).json({
            message: "Job created successfully. You will be notified via email once the scraping is complete.",
            result_id: newJob.result_id,
            status: newJob.status,
        });

    } catch (err) {
        console.error("Error creating job:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.get("/:result_id", async (req, res) => {
    try {
        // --- FIX: Use the 'Job' model, not the 'JSON' object ---
        const job = await Job.findOne({ result_id: req.params.result_id }); 
        
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

         const response = {
            status: job.status,
            profile_url: job.profile_url,
            results: null,
            error: null
        };

        // --- FIX: Check 'job.status', not 'JSON.status' ---
        if (job.status === "complete") {
            // Check if results_json is not null before parsing
            if (job.results_json) { // <-- FIX: 'results_json' (with 's')
                response.results = JSON.parse(job.results_json);
            } else {
                // This will prevent the crash you saw before
                response.results = []; 
            }
        } else if (job.status === "failed") {
            response.error = job.error_message;
        }
        
        return res.status(200).json(response);

    } catch (err) {
        console.error("Error fetching job:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
