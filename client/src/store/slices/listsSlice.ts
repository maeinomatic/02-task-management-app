import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/client';
import type { List, UpdateListRequest } from '../../types';

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
      // Normalize IDs to strings to match frontend List type
      return response.data.data.map((list: any) => ({
        ...list,
        id: String(list.id),
        boardId: String(list.boardId),
      }));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch lists');
    }
  }
);

export const createList = createAsyncThunk(
  'lists/createList',
  async (payload: { title: string; boardId: string | number }, { rejectWithValue }) => {
    try {
      const boardId = Number(payload.boardId);
      const response = await api.post('/api/lists', {
        ...payload,
        boardId: Number.isNaN(boardId) ? payload.boardId : boardId,
      });
      // Normalize IDs to strings to match frontend List type
      const list = response.data.data;
      return {
        ...list,
        id: String(list.id),
        boardId: String(list.boardId),
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create list');
    }
  }
);

// Persist an ordered list of columns for a board (bulk update)
export const reorderLists = createAsyncThunk(
  'lists/reorderLists',
  async (payload: { boardId: string; orderedIds: string[] }, { rejectWithValue }) => {
    try {
      const columns = payload.orderedIds.map((id, idx) => ({ id: Number(id), position: idx }));
      const response = await api.patch('/api/lists/bulk-order', { boardId: Number(payload.boardId), columns });
      const lists = response.data.data;
      return lists.map((l: any) => ({ ...l, id: String(l.id), boardId: String(l.boardId) }));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reorder lists');
    }
  }
);

export const updateList = createAsyncThunk(
  'lists/updateList',
  async ({ id, updates }: { id: string; updates: UpdateListRequest }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/lists/${id}`, updates);
      // Normalize IDs to strings to match frontend List type
      const list = response.data.data;
      return {
        ...list,
        id: String(list.id),
        boardId: String(list.boardId),
      };
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
    // local optimistic reorder (accepts array of list ids in desired order)
    reorderListsLocal: (state, action: PayloadAction<string[]>) => {
      const ordered = action.payload.map(id => state.lists.find(l => l.id === id)).filter(Boolean) as List[];
      state.lists = ordered;
    },
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
      })
      .addCase(reorderLists.fulfilled, (state, action: PayloadAction<List[]>) => {
        state.lists = action.payload;
      });
  }
});

export const { clearError, reorderListsLocal } = listsSlice.actions;
export default listsSlice.reducer;
