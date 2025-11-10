
import axios from "axios";

const API_URL = "https://insta-app-sort.onrender.com/api";

export const createJob = (profile_url, user_email) => {
	return axios.post(`${API_URL}/jobs`, { profile_url, user_email });
};

export const getJob = (result_id) => {
	return axios.get(`${API_URL}/jobs/${result_id}`);
};


