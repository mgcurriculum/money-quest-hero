

## Fix: Dimension Breakdown Table Misalignment in PDF

### Problem
The dimension table uses `table-layout: fixed` but the `width` percentages are set as inline styles on `<td>` elements. With `table-layout: fixed`, column widths are determined by the **first row** only, and percentage widths on `<td>` can behave inconsistently across renderers (especially html2canvas). The combination of `white-space: nowrap` on the dimension name column and long dimension names like "Investment Awareness" can also cause the first column to overflow its declared width.

### Fix
1. **Use `<colgroup>` with `<col>` elements** to explicitly define column widths — this is the reliable way to control columns with `table-layout: fixed`
2. **Remove `width` from `<td>` styles** (let `<colgroup>` handle it)
3. **Remove `white-space: nowrap`** from the dimension name column so long names wrap gracefully instead of pushing the layout

### Change in `src/utils/generateReportPDF.ts`

**Dimension table** (~line 232 in the full HTML output): Add `<colgroup>` before the rows:
```html
<colgroup>
  <col style="width:40%;" />
  <col style="width:38%;" />
  <col style="width:22%;" />
</colgroup>
```

**Dimension row template** (lines 120-134): Remove `width` and `white-space:nowrap` from `<td>` inline styles so columns are governed solely by `<colgroup>`.

