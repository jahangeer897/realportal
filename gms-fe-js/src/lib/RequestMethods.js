import { store } from "@/redux/store";
import { signOut } from "@/redux/slices/userSlice";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const publicRequest = axios.create({
    baseURL: BASE_URL
})

export const userRequest = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Get token from Redux state
const getTokenFromState = () => {
    const state = store.getState();
    return state.user.currentUser.data.token;
};

// Request interceptor - Add token to headers
userRequest.interceptors.request.use(
    (config) => {
        const token = getTokenFromState();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 errors
userRequest.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            store.dispatch(signOut());
        }
        return Promise.reject(error);
    }
);