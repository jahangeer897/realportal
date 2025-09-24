import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",

    initialState: {
        currentUser: null,
        token: null,
        isFetching: false,
        error: false,
    },

    reducers: {
        loginStart: (state) => {
            state.isFetching = true;
            state.error = false;
        },
        loginSuccess: (state, action) => {
            state.isFetching = false;
            state.currentUser = action.payload.user || action.payload;
            state.token = action.payload.token;
            state.error = false;
        },

        loginFailure: (state, action) => {
            state.isFetching = false;
            state.error = action.payload || true;
            state.currentUser = null;
            state.token = null;
        },

        signOut: (state) => {
            state.currentUser = null;
            state.token = null;
            state.isFetching = false;
            state.error = false;
        },

        // Action to update token without full login
        setToken: (state, action) => {
            state.token = action.payload;
        },

        // Action to clear token
        clearToken: (state) => {
            state.token = null;
        },
    },
});

export const {
    loginFailure,
    loginStart,
    loginSuccess,
    signOut,
    setToken,
    clearToken
} = userSlice.actions;

export default userSlice.reducer;