import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/client';

export interface List {
  id: string;
  title: string;
  boardId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface ListsState {
  lists: List[];
  loading: boolean;
  error: string | null;
}

const initialState: ListsState = {
  lists: [],
  loading: false,
  error: null,
};

export const fetchLists = createAsyncThunk(
  'lists/fetchLists',
  async (boardId: string, { rejectWithValue }) => {
    try {
      // server expects query param `board_id` for filtering
      const response = await api.get(`/api/lists?board_id=${boardId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch lists');
    }
  }
);

export const createList = createAsyncThunk(
  'lists/createList',
  async (payload: { title: string; boardId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/lists', payload);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create list');
    }
  }
);

export const updateList = createAsyncThunk(
  'lists/updateList',
  async ({ id, updates }: { id: string; updates: Partial<List> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/lists/${id}`, updates);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update list');
    }
  }
);

export const deleteList = createAsyncThunk(
  'lists/deleteList',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/lists/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete list');
    }
  }
);

const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLists.fulfilled, (state, action: PayloadAction<List[]>) => { state.loading = false; state.lists = action.payload; })
      .addCase(fetchLists.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createList.fulfilled, (state, action: PayloadAction<List>) => { state.lists.push(action.payload); })
      .addCase(updateList.fulfilled, (state, action: PayloadAction<List>) => {
        const idx = state.lists.findIndex(l => l.id === action.payload.id);
        if (idx !== -1) state.lists[idx] = action.payload;
      })
      .addCase(deleteList.fulfilled, (state, action: PayloadAction<string>) => {
        state.lists = state.lists.filter(l => l.id !== action.payload);
      });
  }
});

export const { clearError } = listsSlice.actions;
export default listsSlice.reducer;
