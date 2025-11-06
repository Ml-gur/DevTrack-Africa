# ⚡ Quick Start Guide

Get DevTrack Africa running in 5 minutes!

## Prerequisites

- Node.js 18+ installed ([download here](https://nodejs.org))
- A code editor (VS Code recommended)
- A terminal/command prompt

## Installation

### 1. Get the Code

```bash
# Clone the repository
git clone https://github.com/devtrack-africa/devtrack-africa.git
cd devtrack-africa
```

Or download and extract the ZIP file.

### 2. Install Dependencies

```bash
npm install
```

⏱️ This takes 1-2 minutes...

### 3. Start Development Server

```bash
npm run dev
```

🎉 Open http://localhost:5173 in your browser!

---

## First Steps

### 1. Register an Account
- Click "Enter Platform"
- Fill in your details:
  - Email (can be fake for testing: `test@example.com`)
  - Password (at least 6 characters)
  - Full Name
  - Phone (select country code)
  - Country (from dropdown)
- Click "Create Account"

### 2. Create Your First Project
- Click the big "+" or "Create Project" button
- Fill in:
  - **Project Name**: e.g., "My Portfolio Website"
  - **Description**: Brief summary
  - **Category**: Select from dropdown (Web, Mobile, etc.)
  - **Tech Stack**: Select technologies used
  - **Status**: Planning/Active/Completed
- Click "Create Project"

### 3. Add Tasks to Kanban Board
- Click on your project
- Switch to "Kanban" tab
- Click "+ Add Task"
- Fill in task details
- Drag tasks between columns:
  - **Backlog** → Not started
  - **In Progress** → Currently working
  - **Done** → Completed

### 4. View Analytics
- Click "Analytics" tab in dashboard
- See:
  - Project completion statistics
  - Task performance metrics
  - Time tracking
  - AI-powered insights

---

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## File Structure Overview

```
devtrack-africa/
├── App.tsx                 # Main application
├── components/             # React components
│   ├── StreamlinedDashboard.tsx
│   ├── KanbanBoard.tsx
│   ├── AnalyticsDashboard.tsx
│   └── ui/                # shadcn components
├── contexts/              # React contexts
│   ├── LocalOnlyAuthContext.tsx
│   └── StorageContext.tsx
├── utils/                 # Utilities
│   ├── local-storage-database.ts
│   └── storage-quota-manager.ts
├── types/                 # TypeScript types
└── styles/               # CSS styles
```

---

## Key Features to Try

### ✅ Project Management
- Create multiple projects
- Edit project details
- Delete projects (with confirmation)
- Upload project images

### ✅ Kanban Board
- Add tasks with descriptions
- Set due dates
- Add notes to tasks
- Upload resources/files
- Drag and drop between columns
- Automatic timer tracking

### ✅ Analytics
- View project statistics
- See task completion rates
- Monitor productivity trends
- Get AI-powered insights

### ✅ Profile
- Edit personal information
- Update phone number (with country code)
- Change country selection

### ✅ Storage Management
- Monitor storage usage
- Export data as JSON
- Import data from backup
- Clean up old projects

---

## Testing the App

### Quick Test Flow

1. **Registration**: Create account → Should redirect to dashboard
2. **Projects**: Create project → Appears in dashboard
3. **Kanban**: Add task → Drag to "In Progress" → Timer starts
4. **Analytics**: View stats → Charts display correctly
5. **Persistence**: Refresh page → Data still there
6. **Mobile**: Test on phone → Responsive design works

### Data Persistence

All data is stored in browser localStorage:
- Refresh the page → Data persists ✅
- Close browser → Data persists ✅
- Clear browser data → Data is lost ⚠️

**Pro Tip**: Use the export feature to back up important data!

---

## Common Questions

### Q: Do I need a database?
**A:** No! Everything runs in your browser using localStorage.

### Q: Will my data sync across devices?
**A:** Not currently. Data is local to each browser. Use export/import to transfer.

### Q: Can I use it offline?
**A:** Yes! After the initial load, the app works completely offline.

### Q: What happens if I clear browser data?
**A:** Your projects will be deleted. Always export important data first.

### Q: How much storage do I have?
**A:** Typically 5-10MB depending on your browser. The app will warn you when approaching limits.

---

## Troubleshooting

### Port Already in Use
```bash
# Kill the process on port 5173
# On Mac/Linux:
lsof -ti:5173 | xargs kill

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Build Errors
```bash
# Clear and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### TypeScript Errors
```bash
# Check types
npm run type-check

# Most errors are auto-fixed on save in VS Code
```

### Storage Quota Exceeded
- The app will show a warning
- Use the cleanup tool in settings
- Export and delete old projects

---

## Next Steps

### Customize the App
- Modify colors in `styles/globals.css`
- Add new project categories in project creation
- Customize analytics visualizations

### Deploy to Production
See [DEPLOYMENT_GUIDE_SIMPLE.md](./DEPLOYMENT_GUIDE_SIMPLE.md)

### Learn More
- [Full Features](./FEATURES.md)
- [Deployment Guide](./DEPLOYMENT_READY.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)

---

## Getting Help

### Resources
- **README**: [README.md](./README.md)
- **Full Docs**: Check other .md files in project root
- **Code Comments**: Well-commented codebase

### Debug Mode
Open browser DevTools (F12):
- **Console**: See logs and errors
- **Application**: View localStorage data
- **Network**: Check resource loading

---

## Tips for Success

### Performance
- Keep total projects under 1000
- Regularly clean up completed projects
- Export data periodically for backup
- Use Chrome/Firefox for best performance

### Development
- Use VS Code with TypeScript extension
- Enable auto-save for faster development
- Use React DevTools for debugging
- Test in multiple browsers

### Production
- Run `npm run build` to test production build
- Check bundle size (should be < 500KB gzipped)
- Test on mobile devices before deploying
- Use Lighthouse for performance audits

---

## You're Ready! 🚀

Start building amazing projects with DevTrack Africa!

**Having fun?** Star the repo on GitHub ⭐

**Found a bug?** Open an issue and help improve the platform!

---

**Quick Commands Reference:**
```bash
npm run dev        # Start development
npm run build      # Build for production
npm run preview    # Preview production build
```

**Happy coding!** 💻✨
