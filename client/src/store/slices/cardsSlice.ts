import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/client';

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
      const url = listId ? `/api/cards?listId=${listId}` : '/api/cards';
      const response = await api.get(url);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch cards');
    }
  }
);

export const createCard = createAsyncThunk(
  'cards/createCard',
  async (cardData: { title: string; description?: string; listId: string; assigneeId?: string; dueDate?: string; labels?: string[] }, { rejectWithValue }) => {
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
  async ({ id, updates }: { id: string; updates: Partial<Card> }, { rejectWithValue }) => {
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
    moveCard: (state, action: PayloadAction<{ cardId: string; sourceListId: string; destinationListId: string; newPosition: number }>) => {
      const { cardId, sourceListId, destinationListId, newPosition } = action.payload;
      const cardIndex = state.cards.findIndex(card => card.id === cardId);

      if (cardIndex !== -1) {
        const card = state.cards[cardIndex];

        // Update card's list and position
        card.listId = destinationListId;
        card.position = newPosition;

        // Reorder cards in the destination list
        const destinationCards = state.cards
          .filter(c => c.listId === destinationListId && c.id !== cardId)
          .sort((a, b) => a.position - b.position);

        destinationCards.splice(newPosition, 0, card);

        // Update positions
        destinationCards.forEach((c, index) => {
          c.position = index;
        });
      }
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
        const existingIds = new Set(state.cards.map(card => card.id));

        newCards.forEach((card: Card) => {
          if (!existingIds.has(card.id)) {
            state.cards.push(card);
          } else {
            // Update existing card
            const index = state.cards.findIndex(c => c.id === card.id);
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
        const index = state.cards.findIndex(card => card.id === action.payload.id);
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
        state.cards = state.cards.filter(card => card.id !== action.payload);
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, moveCard } = cardsSlice.actions;
export default cardsSlice.reducer;