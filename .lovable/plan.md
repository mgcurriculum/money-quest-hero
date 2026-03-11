

### Task: Replace emojis with real icons in Report Screen

**File:** `src/components/game/ReportScreen.tsx`

**Changes:**

1. **Import Lucide icons** — add `Share2, MessageCircle, Facebook, Instagram, Download, Mail, RefreshCw` from `lucide-react`

2. **Share section (lines 260-275)** — replace emoji icons with SVG icons:
   - WhatsApp: `<MessageCircle size={14} />` 
   - Facebook: `<Facebook size={14} />`
   - Instagram: `<Instagram size={14} />`
   - Section title: `<Share2 size={14} />` instead of 📢

3. **Download/Email buttons (lines 278-285)**:
   - Download PDF: `<Download size={16} />` instead of 📥
   - Send to Email: `<Mail size={16} />` instead of 📧

4. **Take Test Again button (line 289)**:
   - `<RefreshCw size={16} />` instead of 🔄

