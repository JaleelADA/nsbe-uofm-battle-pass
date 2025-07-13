## 🏆 NSBE UofM Battle Pass 2025

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://nsbeum.live)
[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A gamified mentorship and professional development platform for the National Society of Black Engineers (NSBE) University of Michigan chapter. Track progress, earn achievements, and unlock career development opportunities through an interactive Battle Pass system.


## 🚀 Features

### 🎯 **Core Functionality**
- **Real-time Leaderboard** - Live ranking system with Google Sheets integration
- **Achievement System** - Unlock badges for professional development milestones
- **Progress Tracking** - XP-based progression with visual feedback
- **Smart Search** - Find any student in the complete leaderboard
- **User Recognition** - Highlight your position and rank

### 🔥 **Mentorship Hub**
- **NSBE Mentoring** - Program details and sign-up portal
- **Professional Development** - Resume resources and interview prep
- **Academic Corner** - study resources
- **Interactive Filters** - Navigate between different development areas

### 📊 **Data Integration**
- **Google Sheets API** - Live data synchronization
- **Dynamic Updates** - Real-time achievement calculation
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18 (via CDN), HTML5, CSS3
- **Styling**: Tailwind CSS, Custom CSS animations
- **Data**: Google Sheets API integration
- **Deployment**: GitHub Pages / Netlify / Vercel
- **Build Tools**: Live Server (development), Babel (JSX compilation)

## 📦 Installation & Setup

### **Prerequisites**
- Web browser with JavaScript enabled
- Live Server extension (for development)
- Google Sheets with public access

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/yourusername/BP-Game.git
cd BP-Game

# Start development server
# Using Live Server extension in VS Code
# Or using Python
python -m http.server 8000

# Visit http://localhost:8000
```

### **Google Sheets Setup**
1. Create a Google Sheet with columns: `Name`, `XP`, `Tier`, `Recruits`
2. Make the sheet publicly viewable
3. Copy the sheet ID from the URL
4. Update the `GOOGLE_SHEET_URL` in `src/app-optimized.js`

## 🎮 Usage

### **For Students**
1. **Enter your name** to see your progress and rank
2. **View achievements** - See unlocked badges and XP earned
3. **Check leaderboard** - See where you rank among peers
4. **Explore mentorship** - Access development resources

### **For Administrators**
1. **Update Google Sheet** - Add new students, update XP, change tiers
2. **Monitor engagement** - Track participation through the leaderboard
3. **Manage achievements** - Achievements auto-update based on XP thresholds

## 🏗️ Project Structure

```
nsbe-uofm-battle-pass/
├── index.html              # Web app main entry point
├── src/                    # Web application source
│   ├── app-optimized.js    # Main React application (optimized)
│   ├── app.js             # Original application (full-featured)
│   ├── App.jsx            # Alternative React component
│   ├── main.jsx           # React entry point
│   └── index.css          # Custom styles
├── mobile/                 # 📱 React Native mobile app
│   ├── src/
│   │   ├── App.js         # Main mobile app component
│   │   ├── components/    # Mobile UI components
│   │   ├── services/      # Google Sheets integration
│   │   ├── styles/        # Mobile styling and theme
│   │   └── utils/         # Utilities and static data
│   ├── package.json       # Mobile app dependencies
│   └── README.md          # Mobile setup instructions
├── tailwind.config.js     # Tailwind configuration
└── README.md              # Project documentation
```

## 📱 Mobile App

A React Native mobile application is available in the `/mobile` directory with:

- **Full leaderboard search** - Find any user in the complete database
- **Real-time data sync** - Same Google Sheets integration as web app
- **Mobile-optimized UI** - Touch-friendly interface with native components
- **Core features** - User stats, badges, events, announcements, and leaderboard

See [`/mobile/README.md`](./mobile/README.md) for setup instructions.

## 🎨 Customization

### **Styling**
- Edit `tailwind.config.js` for theme colors
- Modify NSBE brand colors in `src/app-optimized.js`
- Add custom animations in the `<style>` section

### **Achievement System**
```javascript
// Add new achievements in src/app-optimized.js
const achievements = [
  {
    name: "New Achievement",
    desc: "Description here",
    icon: "🏆",
    xp: 100,
    category: "professional",
    status: "locked"
  }
];
```

### **Google Sheets Integration**
```javascript
// Update sheet URL in src/app-optimized.js
const GOOGLE_SHEET_URL = "your-google-sheet-url-here";
```

## 🚀 Deployment

### **GitHub Pages**
```bash
# Enable GitHub Pages in repository settings
# Point to main branch, root folder
# Add custom domain if available
```

### **Netlify**
1. Connect GitHub repository
2. Build settings: Leave empty (static site)
3. Publish directory: `/`

### **Custom Domain**
1. Purchase domain (Name.com, GoDaddy, etc.)
2. Configure DNS records (see deployment docs)
3. Enable HTTPS in hosting platform

## 🤝 Contributing

We welcome contributions from NSBE members and the broader community!

### **How to Contribute**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Contribution Guidelines**
- Follow existing code style and structure
- Test all changes thoroughly
- Update documentation as needed
- Ensure mobile responsiveness
- Maintain accessibility standards

## 📋 Roadmap

### **Version 2.0**
- [x] User authentication system
- [x] Mobile UI
- [ ] Push notifications for events
- [ ] Social features (friend connections)
- [ ] Advanced analytics dashboard

### **Integration Goals**
- [ ] Canvas LMS integration
- [ ] University career services API
- [ ] NSBE national database sync
- [ ] Calendar integration for events

## 🐛 Known Issues

- **Large datasets**: Performance may slow with 500+ students
- **IE compatibility**: Not supported (requires modern browser)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **Development Team**
- **Lead Developer**: [Jaleel Drones](https://github.com/JaleelADA)
- **NSBE UofM Chapter**: Mentorship program design
- **P-Zone Partnership**: Professional development content

### **Special Thanks**
- NSBE UofM Executive Board
- University of Michigan Engineering Career Resource Center
- P-Zone and M-Zone collaboration partners

## 📞 Support & Contact

### **Technical Support**
- Create an issue on GitHub
- Email: [nsbe.membership@umich.edu](mailto:nsbe.membership@umich.edu)

### **NSBE UofM Chapter**
- Website: [NSBE UofM](https://maizepages.umich.edu/organization/nsbe)
- Email: [nsbe.uofm@umich.edu](mailto:nsbe.uofm@umich.edu)

### **Professional Development Partners**
- **P-Zone**: Professional development workshops
- **M-Zone**: Mentorship program coordination

---

<div align="center">

**Built with ❤️ for NSBE UofM | Empowering Excellence Through Technology**

[🔗 Live site](https://nsbeum.live) • [📧 Contact](mailto:jaleeldrones1@gmail.com) • [🐛 Report Bug](https://github.com/JaleelADA/BP-Game/issues)

</div>
