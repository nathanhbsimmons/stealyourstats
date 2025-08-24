# DESIGN_GUIDE.md
**Retro Brutalist UX/UI Library Specification**  
_For use in Steal Your Stats (Grateful Dead Song Lookup Tool)_

---

## 1. Core Design Principles
- **Aesthetic:** Retro Windows 95 / brutalist web design.  
- **Palette:** Black & white only (grayscale where necessary). No gradients, no shadows, no color.  
- **Typography:** Serif headings, sans-serif body. Large bold headings, smaller pixel-like body text.  
- **Layout:** Boxy windows with thick borders, horizontal rules, and deliberate spacing.  
- **Interactions:** Minimal hover animations (e.g., underline, invert background). No smooth gradients, just hard swaps.  
- **Consistency:** Every UI element should look like it belongs in a retro OS window.  

---

## 2. Layout and Window Components

### Window Shell
- **Top Bar:**  
  - Rectangular with double horizontal line borders.  
  - Close button (`X`) on the left side, bold and oversized.  
  - Title aligned center or left in bold serif font.  

- **Body Area:**  
  - White/gray background with black text.  
  - Uses thin dotted or striped lines for separators.  

- **Footer (Optional):**  
  - Monospaced text or “status bar” line with minimal system info (optional).  

---

## 3. Navigation

### Sidebar Navigation
- Vertical file/folder tree.  
- Icons: square folder glyphs or minimalist ASCII-style.  
- Selected item → bold text with a filled black background highlight.  
- Use fixed-width font for all sidebar entries.  

### Top Navigation (when needed)
- Grid of square retro-style icons with labels below (see screenshot with WhatsApp/Instagram/LinkedIn/Spotify/Email).  
- All icons are **outlined black-and-white glyphs** inside rounded squares.  

---

## 4. Typography
- **Headings:** Large serif (e.g., Georgia, Times). Bold, uppercase optional.  
- **Body:** Sans-serif or monospaced (Arial, Helvetica, Courier New).  
- **Labels/Buttons:** All-caps, bold.  
- **Alignment:** Left-aligned, wide spacing, generous margins.  

---

## 5. Interactive Elements

### Buttons
- Rectangular with **thick black outline**.  
- Default background: white.  
- Hover: black background with inverted white text.  
- Example: “Descarga manual de instrucciones”.  

### Inputs
- Bordered rectangular text fields.  
- Placeholder text is gray, retro terminal style.  
- Checkboxes: square with heavy outline.  

### Dropdowns
- Flat with black outline.  
- Options stacked vertically, blocky selection highlight.  

---

## 6. Content Modules

### Text Pages (like “Hysteria Culture”)
- Wide two-column layout:  
  - Left: Navigation / section index.  
  - Right: Main article with heading, paragraph text, and embedded media.  
- Subheadings styled as **smaller bold serif headings**.  

### Song Search Results
- Render in **list view** styled like a retro directory browser:  
  - Song name → bold clickable item.  
  - Metadata aligned in monospaced columns (date, venue, etc.).  
  - Divider lines between results.  

### Song Detail Page
- Header block with **song title in oversized serif font**.  
- Metadata (debut, last, longest, shortest, BPMs, counts) in **grid or table**, styled as black-bordered cells.  
- Graphs (avg duration per year) → render as **ASCII-inspired bar charts** or black-on-white line graphs with minimal axes.  

### Performance List
- Table-like display.  
- Columns: Date, Venue, Duration, BPM, Recording link.  
- Each row separated with thin black rule.  

### Show Detail
- Setlist displayed like a **retro text file**: numbered/indented list, monospaced font.  
- “Segue” represented with `→`.  
- Recording links styled as square buttons: `[▶ PLAY]`.  

### Playback UI
- Black rectangular bar with simple white controls: `⏮ ⏯ ⏭`.  
- Timeline: dotted line with `●` for scrubber.  
- Timestamp in monospaced font aligned right.  

---

## 7. System UI Elements

### Status Cards (like Rafindows 95 “skills”)
- Box with bordered edges, divided into labeled rows.  
- “Processor,” “Skills,” etc. are labels in bold left column, values on right.  
- Include humorous/quirky system-like descriptors when applicable (can be swapped with stats about songs/shows).  

### Notification / Error
- Modal window styled like Windows 95 error dialogs.  
- Large bold title (“ERROR” or “NOTICE”).  
- Monospaced body text.  
- Button row with `[OK]` `[CANCEL]` in square borders.  

---

## 8. Iconography
- Icons must be **pixel-simplified, black-and-white line art**.  
- Shapes inspired by retro OS glyphs (floppy disk, folder, magnifying glass, play button, envelope, etc.).  
- Ensure **uniform stroke width** (2–3px).  

---

## 9. Accessibility
- High contrast: all-black on all-white (or inverse).  
- Large clickable areas (no micro-targets).  
- Keyboard navigable.  
- Avoid purely color-based indicators—use symbols (✓, X, →).  

---

## 10. Components Inventory (must build in library)
- **Window Shell** (title bar + body + footer).  
- **Sidebar Navigation Tree**.  
- **Icon Grid Navigation**.  
- **Text Page / Article Layout**.  
- **Table (with sortable headers)**.  
- **Search Bar**.  
- **List Item / Directory Row**.  
- **Status Card**.  
- **Playback Bar**.  
- **Modal (Error/Notice Dialog)**.  
- **Form Elements (Input, Button, Dropdown, Checkbox, Radio)**.  
- **Charts (ASCII-inspired bar/line)**.  

---

## 11. Applied to Steal Your Stats
- **Search Page:** Sidebar nav (songs/shows) + main search field + retro results list.  
- **Song Page:** Window shell with title bar → Song summary card + ASCII chart + playback bar.  
- **Performance List:** Table with sortable headers styled as Windows 95 file explorer.  
- **Show Page:** Retro text file setlist + recording playback buttons.  
- **Era Blurb:** Render as **status message** in monospaced box below metadata.  
- **Error Handling:** Modal-style Windows 95 “Error: Data Unavailable” box.  
