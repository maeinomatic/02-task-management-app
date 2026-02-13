import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/client';
import { UpdateCardRequest } from '../../types';

export interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  position: number;
  assigneeId?: string;
  dueDate?: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

interface CardsState {
  cards: Card[];
  loading: boolean;
  error: string | null;
}

const initialState: CardsState = {
  cards: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async (listId: string | undefined, { rejectWithValue }) => {
    try {
      // query param expected as `list_id`
      const url = listId ? `/api/cards?list_id=${listId}` : '/api/cards';
      const response = await api.get(url);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch cards');
    }
  }
);

export const createCard = createAsyncThunk(
  'cards/createCard',
  async (cardData: { title: string; description?: string; listId: string | number; assigneeId?: string; dueDate?: string; labels?: string[] }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/cards', cardData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create card');
    }
  }
);

export const updateCard = createAsyncThunk(
  'cards/updateCard',
  async ({ id, updates }: { id: string; updates: UpdateCardRequest }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/cards/${id}`, updates);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update card');
    }
  }
);

export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/cards/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete card');
    }
  }
);

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic updates for drag and drop
    moveCard: (state, action: PayloadAction<{ cardId: string; destinationListId: string; newPosition: number }>) => {
      const { cardId, destinationListId, newPosition } = action.payload;
      const cardIdKey = String(cardId);
      const destinationListKey = String(destinationListId);
      const cardIndex = state.cards.findIndex(card => String(card.id) === cardIdKey);

      if (cardIndex === -1) return;

      const card = state.cards[cardIndex];
      const sourceListId = String(card.listId);
      const sourceListKey = String(sourceListId);

      // Remove card from source list (by id)
      // and reindex the source list positions
      const sourceCards = state.cards
        .filter(c => String(c.listId) === sourceListKey && String(c.id) !== cardIdKey)
        .sort((a, b) => a.position - b.position);
      sourceCards.forEach((c, idx) => { c.position = idx; });

      // Prepare destination list cards (excluding moved card)
      const destinationCards = state.cards
        .filter(c => String(c.listId) === destinationListKey && String(c.id) !== cardIdKey)
        .sort((a, b) => a.position - b.position);

      // Update moved card metadata
      card.listId = destinationListId;
      // splice into destination at newPosition
      const insertIndex = Math.max(0, Math.min(newPosition, destinationCards.length));
      destinationCards.splice(insertIndex, 0, card);

      // Update positions in destination list
      destinationCards.forEach((c, index) => {
        c.position = index;
      });

      // Finally, merge back updates into state.cards
      // For each updated card in sourceCards and destinationCards, find and replace
      const updatedMap = new Map<string, { listId: string; position: number }>();
      sourceCards.forEach(c => updatedMap.set(String(c.id), { listId: String(c.listId), position: c.position }));
      destinationCards.forEach(c => updatedMap.set(String(c.id), { listId: String(c.listId), position: c.position }));
      // also ensure the moved card is present
      updatedMap.set(String(card.id), { listId: String(card.listId), position: card.position });

      state.cards = state.cards.map(c => {
        const upd = updatedMap.get(String(c.id));
        if (upd) return { ...c, listId: upd.listId, position: upd.position };
        return c;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cards
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false;
        // Merge with existing cards to avoid losing data
        const newCards = action.payload;
        const existingIds = new Set(state.cards.map(card => String(card.id)));

        newCards.forEach((card: Card) => {
          if (!existingIds.has(String(card.id))) {
            state.cards.push(card);
          } else {
            // Update existing card
            const index = state.cards.findIndex(c => String(c.id) === String(card.id));
            if (index !== -1) {
              state.cards[index] = card;
            }
          }
        });
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create card
      .addCase(createCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.loading = false;
        state.cards.push(action.payload);
      })
      .addCase(createCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update card
      .addCase(updateCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cards.findIndex(card => String(card.id) === String(action.payload.id));
        if (index !== -1) {
          state.cards[index] = action.payload;
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete card
      .addCase(deleteCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = state.cards.filter(card => String(card.id) !== String(action.payload));
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, moveCard } = cardsSlice.actions;
export default cardsSlice.reducer;