

### Task: Add "Clear All" Confirmation Dialog with Type-to-Confirm

**Goal:** Replace the simple `confirm()` dialog with a proper AlertDialog that requires typing "clear" to confirm deletion of all questions for a profile.

**Implementation Details:**

1. **Update `src/pages/admin/Questions.tsx`:**
   - Add state for `clearConfirmOpen` (boolean) and `clearConfirmText` (string)
   - Create `openClearConfirm()` handler to open the dialog
   - Modify `handleClearAll()` to check if `clearConfirmText === "clear"` before proceeding
   - Replace the simple `confirm()` with the AlertDialog component
   - Add AlertDialog imports

2. **AlertDialog Design:**
   - Show warning icon and title "Clear All Questions"
   - Display message: "This will permanently delete all {count} questions for profile {selectedProfile}. This action cannot be undone."
   - Input field for typing "clear"
   - "Cancel" and "Clear All" buttons
   - Disable "Clear All" button until "clear" is typed exactly
   - Use destructive styling (red button)

3. **UI Flow:**
   - Click "Clear All" button → Opens AlertDialog
   - User must type "clear" in input field
   - Then can click "Clear All" to proceed with deletion

