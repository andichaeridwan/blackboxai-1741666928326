import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { routesReducer } from './slices/routesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    routes: routesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
