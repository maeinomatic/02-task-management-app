# Plan: Implement Advanced Board/Card/Column Management in Frontend

**TL;DR:** The frontend currently only creates boards but lacks full CRUD for boards, columns, and cards. We'll integrate existing backend endpoints (boards, columns, cards) into the React app with Redux Toolkit, add UI components for board/column/card management, and implement drag-and-drop. No new tables/endpoints needed yet, but we'll add position-based updates for reordering.

## Steps

1. **Audit Current Frontend Integration**  
   Review the client code to confirm API service functions exist for all board/column/card endpoints (GET, POST, PATCH, DELETE). Update Axios services if missing, ensuring they match the Rust backend contract.

2. **Add Board Listing and Selection UI**  
   Create a board dashboard component that fetches and displays all boards using `get_all_boards`. Add navigation to select/view a specific board, updating the Redux store with the selected board.

3. **Implement Board CRUD in UI**  
   Add forms/modals for creating, editing, and deleting boards. Connect to existing `create_board`, `update_board`, and `delete_board` endpoints. Update Redux to reflect changes and handle optimistic updates.

4. **Add Column Management**  
   For the selected board, fetch and display columns using `get_columns_by_board_id` (assuming this endpoint exists). Add UI to create, edit, and delete columns, connecting to column CRUD endpoints. Ensure columns are ordered by position.

5. **Implement Card Management**  
   Within each column, fetch and display cards using `get_cards_by_column_id`. Add forms for creating, editing, and deleting cards. Connect to card CRUD endpoints and update Redux for real-time UI updates.

6. **Add Drag-and-Drop Functionality**  
   Integrate a drag-and-drop library (e.g., `react-beautiful-dnd` or `@dnd-kit/core`) to move cards between columns and reorder within columns. On drop, call PATCH endpoints to update card positions (add if not present).

7. **Enhance Redux Store**  
   Expand the Redux store to manage boards, columns, and cards state. Add thunks for async API calls and selectors for efficient data access. Handle loading/error states for better UX.

8. **Add Error Handling and Validation**  
   Implement client-side validation for forms and display API errors. Add loading indicators and retry mechanisms for failed requests.

## Verification

- Test board creation, listing, editing, and deletion.
- Verify column and card CRUD within a board view.
- Confirm drag-and-drop updates positions correctly and persists to DB.
- Run the app end-to-end: Create board → Add columns/cards → Move cards → Verify in DB and UI.

## Decisions

- No new tables/endpoints needed initially; leverage existing ones. Add position update endpoints (PATCH for cards/columns) if drag-and-drop requires it.
- Use `react-beautiful-dnd` for drag-and-drop due to simplicity and React compatibility.
- Prioritize board/column/card CRUD before advanced features like sharing or real-time updates.