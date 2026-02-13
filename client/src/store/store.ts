import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from './slices/boardsSlice';
import cardsReducer from './slices/cardsSlice';
import uiReducer from './slices/uiSlice';
import listsReducer from './slices/listsSlice';

export const store = configureStore({
  reducer: {
    boards: boardsReducer,
    cards: cardsReducer,
    ui: uiReducer,
    lists: listsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;