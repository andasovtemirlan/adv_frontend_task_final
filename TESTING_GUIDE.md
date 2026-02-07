# Testing & Verification Guide

## Quick Start After Pull

```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Run development server
npm run dev

# Run tests
npm test
npm run test:ui
npm run playwright:test
```

## Manual Verification Steps

### 1. Application Startup
- [ ] App starts at `http://localhost:5173`
- [ ] Dark minimal theme applied (slate background, cyan accents)
- [ ] IBM Plex Mono font visible in all text
- [ ] Right sidebar appears fixed on desktop (not left)

### 2. Navigation
- [ ] Click each sidebar menu item:
  - Dashboard → Shows existing dashboard
  - Projects → Shows projects list
  - Tasks → Kanban board loads
  - Teams → Teams page loads
  - Members → Members page loads
  - Activity → Activity feed loads
  - **Calendar** → Shows calendar with task events ✅ NEW
  - **Time Tracking** → Shows hours tracking table ✅ NEW
  - **Reports** → Shows analytics dashboard ✅ NEW
  - **Search** → Shows advanced filters ✅ NEW

### 3. Calendar Page (`/calendar`)
Verify:
- [ ] Calendar grid displays full month view
- [ ] Tasks with dueDate appear as events
- [ ] Click on event → modal shows task details (title, status, priority, due date)
- [ ] Modal closes properly
- [ ] No console errors in DevTools
- [ ] Responsive on mobile (stacked layout)

### 4. Time Tracking Page (`/tracking`)
Verify:
- [ ] Table shows all tasks with columns: Title, Project, Estimated Hours, Actual Hours, Variance, Accuracy
- [ ] Summary section shows: Total Estimated, Total Actual, Overall Accuracy %
- [ ] "Log" button on each task row opens dialog
- [ ] Dialog allows entry of actual hours (number input)
- [ ] Submit button updates task (check Network tab in DevTools)
- [ ] Task row updates with new actual hours and recalculated metrics

### 5. Reports Page (`/reports`)
Verify:
- [ ] Pie chart shows task status distribution (backlog, todo, in_progress, review, done)
- [ ] Pie chart shows priority breakdown (low, medium, high, critical)
- [ ] Bar chart shows project progress percentages
- [ ] Line chart shows time tracking metrics (estimated, actual, variance)
- [ ] 4 summary cards display: Total Projects, Total Tasks, Completed Tasks, Completion Rate %
- [ ] Charts responsive (resize browser window)
- [ ] Colors match dark theme (slate background, cyan/orange/green colors)

### 6. Advanced Search Page (`/search`)
Verify:
- [ ] **Filters Panel**:
  - [ ] Title text input filters tasks in real-time
  - [ ] Status dropdown filters by backlog/todo/in_progress/review/done
  - [ ] Priority dropdown filters by low/medium/high/critical
  - [ ] Project dropdown shows available projects
  - [ ] Clear Filters button resets all dropdowns
  - [ ] Results count updates as filters change
  
- [ ] **Results Table**:
  - [ ] Shows first 10 matching tasks
  - [ ] Columns: Title, Status (badge), Priority (colored badge)
  - [ ] Table empty when no matches
  
- [ ] **Presets Panel**:
  - [ ] "Save as Preset" button opens dialog
  - [ ] Dialog requires preset name
  - [ ] After save, preset appears in list
  - [ ] Click preset loads filters (all dropdowns and text update)
  - [ ] Edit icon allows renaming preset
  - [ ] Delete icon removes preset
  - [ ] Refresh page → presets persist (localStorage)
  - [ ] Can create multiple presets with different filter combinations

### 7. Sidebar Menu
Verify:
- [ ] All 10 menu items visible (scroll if needed)
- [ ] Icons display correctly:
  - Dashboard: Dashboard icon
  - Projects: Folder icon
  - Tasks: Assignment icon
  - Teams: People icon
  - Members: PersonAdd icon
  - Activity: Timeline icon
  - Calendar: EventNote icon ✅ (was Calendar, fixed to EventNote)
  - Time Tracking: Schedule icon ✅
  - Reports: Assessment icon ✅
  - Search: Search icon ✅
- [ ] Current page highlighted with selected background color
- [ ] Mobile: Menu toggle button works, drawer slides in from right

### 8. TypeScript Build
Verify:
```bash
npm run build
```
Expected output:
- [ ] No TypeScript errors
- [ ] Vite build succeeds
- [ ] dist/ folder created with all assets
- [ ] Build time ~28-30 seconds
- [ ] Output includes 13,304+ modules transformed

### 9. Date Pickers Component
The DatePickers component is ready but not yet integrated into forms. To verify it compiles:
```bash
# Check imports in TypeScript
grep -r "DatePickers" src/
```
Expected:
- [ ] `src/shared/components/DatePickers.tsx` exists
- [ ] Exports `DateRangePicker` and `DatePickerField`
- [ ] Can be imported in any form component

### 10. Test Suite
Run existing tests:
```bash
npm test
```
Expected:
- [ ] 8 Vitest tests pass (validators, auth, tasks, formatters)
- [ ] 3 Playwright E2E tests pass (login, protected routes, kanban)
- [ ] No failing tests

### 11. Performance & Console
Open DevTools (F12):
- [ ] **Console**: No errors or warnings
- [ ] **Network**: 
  - [ ] Initial load <3s
  - [ ] API calls to `/tasks`, `/projects`, `/teams` complete successfully
  - [ ] No failed requests
- [ ] **Performance**: 
  - [ ] Calendar renders 15+ tasks without lag
  - [ ] Reports charts animate smoothly
  - [ ] Search filters respond instantly to input changes
  - [ ] Sorting/pagination (if implemented) works

## Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)

Expected: All features work identically across browsers

## Responsive Mobile Testing

Resize browser to:
- [ ] 320px width (mobile phone)
- [ ] 768px width (tablet)
- [ ] 1024px+ width (desktop)

Verify:
- [ ] Sidebar drawer toggles on mobile
- [ ] Calendar adapts to narrow width
- [ ] Charts remain readable
- [ ] Form inputs stack vertically on narrow screens

## Git Verification

```bash
git log --oneline
```
Expected commits:
1. Fix TypeScript compilation errors
2. Phase 6: Add Advanced Search with presets + integrate all new pages
3. [Prior commits for phases 1-5]
4. [Test infrastructure baseline]

## Known Limitations

- [ ] Date picker components created but not integrated into Project/Task forms yet
- [ ] Advanced search for assignee works but UI only accepts from first 10 projects
- [ ] Calendar events click modal read-only (no edit action)
- [ ] Time tracking doesn't calculate task schedule impact

## Success Criteria

✅ All 10 checkboxes under each section should be marked
✅ No TypeScript errors on build
✅ No console errors in browser
✅ All sidebar menu items navigate correctly
✅ New pages render with data from mock database
✅ Tests pass (unit + E2E)
✅ Responsive design works on mobile/tablet/desktop

---

**Last Updated**: After Phase 6 Implementation
**Status**: Ready for Acceptance Testing
