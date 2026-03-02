import { configureStore } from '@reduxjs/toolkit';
import { formsApi } from './api';
import './formsApi.endpoints';

export const store = configureStore({
  reducer: {
    [formsApi.reducerPath]: formsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(formsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
