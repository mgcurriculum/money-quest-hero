

# Show Campaign Code in QR Dialog

## Change
Add the campaign code prominently in the QR Code dialog, below the QR image and above the link, so admins can share it visually alongside the QR.

## File: `src/pages/admin/Campaigns.tsx`
- In the QR dialog (lines 210-221), add a styled campaign code display between the QR image and the link
- Show it as a large, bold, monospaced text like `Campaign Code: AB12C` so it's easy to read and share

Single file, ~3 lines added.

