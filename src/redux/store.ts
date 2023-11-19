import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./features/bookslice";

const store = configureStore({
  reducer: {
    bookReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
