# 🚀 DevTrack Africa

> **The Ultimate Project Management Platform for African Developers**

[![Production Ready](https://img.shields.io/badge/status-production--ready-brightgreen)]()
[![Local Storage](https://img.shields.io/badge/storage-local--only-blue)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.2-blue)]()
[![React](https://img.shields.io/badge/react-18.2-blue)]()
[![Tailwind CSS](https://img.shields.io/badge/tailwind-4.0-38bdf8)]()

Track your coding journey, manage projects with Kanban boards, and monitor your productivity - all without external database dependencies.

---

## ✨ Features

### 🎯 Core Features (MVP)

1. **Project Management**
   - Create, read, update, and delete projects
   - Project categorization (Web, Mobile, Desktop, AI/ML, etc.)
   - Tech stack tracking
   - Project status monitoring
   - Project images and descriptions

2. **Kanban Board Task Management**
   - Drag-and-drop task organization
   - Task categories: Backlog, In Progress, Done
   - Due date tracking with calendar picker
   - Automatic timer functionality
   - Task notes and descriptions
   - Resource uploads and attachments
   - Subtask management

3. **Analytics Dashboard**
   - Project completion statistics
   - Task performance metrics
   - Time tracking analytics
   - AI-powered insights
   - Productivity trends
   - Visual charts and graphs

4. **Authentication & Profiles**
   - Local storage-based authentication
   - User registration with African country support
   - Profile management with phone formatting
   - Secure session handling
   - No external database required

5. **Storage Management**
   - Comprehensive quota monitoring
   - Storage cleanup tools
   - Data export/import
   - Automatic storage warnings
   - Efficient data persistence

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript 5.2** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Vite 5** - Lightning-fast build tool

### UI Components
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icon library
- **Motion** - Smooth animations
- **Recharts** - Interactive charts
- **React Beautiful DnD** - Drag-and-drop functionality

### Storage & State
- **Local Storage** - Browser-based data persistence
- **React Context API** - State management
- **IndexedDB** - Large file storage (resources, images)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/devtrack-africa/devtrack-africa.git
cd devtrack-africa

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

---

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and import your repository
4. Click "Deploy" (Vercel auto-detects configuration)

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Deploy

### Manual Hosting

```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

See [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) for detailed deployment instructions.

---

## 🎨 Design System

### Colors
- **Primary**: Blue-600 (#2563eb)
- **Success**: Green-600 (#16a34a)
- **Background**: Blue-50, Green-50 gradients
- **Text**: Gray-900, Gray-700

### Typography
- **Font**: System fonts (-apple-system, Segoe UI, Roboto)
- **Responsive**: Mobile-first approach
- **Minimalist**: Clean, modern aesthetic

---

## 📱 Core User Flows

### 1. Getting Started
1. Visit homepage
2. Click "Enter Platform"
3. Register with email and profile details
4. Automatic login to dashboard

### 2. Creating a Project
1. Click "New Project" button
2. Fill in project details (name, description, category, tech stack)
3. Optional: Upload project image
4. Click "Create Project"
5. Project appears in dashboard

### 3. Managing Tasks
1. Open project from dashboard
2. Switch to "Kanban" tab
3. Add tasks using "Add Task" button
4. Drag tasks between columns (Backlog → In Progress → Done)
5. Click task to add due dates, notes, and resources
6. Timer starts automatically when moved to "In Progress"

### 4. Viewing Analytics
1. Open "Analytics" tab in dashboard
2. View project statistics and charts
3. See AI-powered insights
4. Monitor productivity trends

---

## 🗂️ Project Structure

```
devtrack-africa/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── KanbanBoard.tsx  # Task management
│   ├── AnalyticsDashboard.tsx
│   └── ...
├── contexts/            # React contexts
│   ├── LocalOnlyAuthContext.tsx
│   └── StorageContext.tsx
├── utils/               # Utility functions
│   ├── local-storage-database.ts
│   ├── storage-quota-manager.ts
│   └── ...
├── types/               # TypeScript types
├── styles/              # Global styles
│   └── globals.css
├── App.tsx              # Main app component
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── vercel.json          # Deployment config
└── package.json         # Dependencies
```

---

## 🔒 Privacy & Security

### Local Storage Only
- **No external database** - All data stored in browser
- **No tracking** - No analytics, no telemetry
- **No data collection** - Your data stays on your device
- **Offline-capable** - Works without internet after initial load

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin

---

## 🧪 Testing

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Manual Testing
See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing checklist.

---

## 📊 Performance

### Optimizations
- ✅ Code splitting (vendor, ui, forms, charts)
- ✅ Lazy loading for routes
- ✅ Image optimization
- ✅ Tree-shaking
- ✅ Minification (ESBuild)
- ✅ Browser caching

### Target Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: 90+

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow existing code style
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 Scripts

```json
{
  "dev": "vite",                    // Start dev server
  "build": "npm run build",          // Production build
  "preview": "vite preview",         // Preview build
  "lint": "eslint .",                // Run linter
  "type-check": "tsc --noEmit"       // Check types
}
```

---

## 🌍 African Developer Focus

### Phone Number Formatting
- Support for all African country codes
- Automatic formatting for major African countries
- Country selector in profile

### Localization Ready
- Structure supports internationalization
- Easy to add new languages
- African time zone aware

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** - For beautiful UI components
- **Tailwind CSS** - For utility-first styling
- **React Team** - For the amazing framework
- **African Developer Community** - For inspiration and support

---

## 📞 Support

### Resources
- **Documentation**: [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)
- **Features**: [FEATURES.md](./FEATURES.md)
- **Quick Reference**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

### Issues
Report bugs or request features via GitHub Issues.

---

## 🎯 Roadmap

### Completed ✅
- [x] Local storage architecture
- [x] Project management (CRUD)
- [x] Kanban board with drag-and-drop
- [x] Analytics dashboard
- [x] Authentication system
- [x] Profile management
- [x] Storage management
- [x] Responsive design

### Future Enhancements 🔮
- [ ] Data sync across devices (optional cloud backup)
- [ ] Team collaboration features
- [ ] Export to PDF/Excel
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Integration with GitHub/GitLab
- [ ] Advanced analytics
- [ ] Project templates library

---

## ⚡ Performance Tips

### For Users
- Clear old projects regularly to free up storage
- Use export/import to backup important data
- Keep browser updated for best performance

### For Developers
- Use React DevTools for profiling
- Monitor bundle sizes
- Test on slower devices/networks
- Use Lighthouse for audits

---

## 🌟 Star History

If you find this project helpful, please consider giving it a star ⭐

---

**Built with ❤️ for African Developers**

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: November 3, 2025
