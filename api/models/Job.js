const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
	{
		profile_url: {
			type: String,
			required: true,
			trim: true,
			index: true,
		},
		user_email: {
			type: String,
			required: true,
			trim: true,
		},
		status: {
			type: String,
			enum: ["pending", "scraping", "complete", "failed"],
			default: "pending",
			index: true,
		},
		result_json: {
			type: String,
			default: null,
		},
		error_message: {
			type: String,
			default: null,
		},
		result_id: {
			typr: String,
			unique: true,
			default: () => new mongoose.Types.ObjectId().toHexString(),
		},
	},
	{
		timestamps: true,
	}
);
module.exports = mongoose.model("Job", JobSchema);