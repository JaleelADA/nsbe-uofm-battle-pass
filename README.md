## 🏆 NSBE UofM Battle Pass 2025

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://nsbeum.live)
[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A gamified mentorship and professional development platform for the National Society of Black Engineers (NSBE) University of Michigan chapter. Track progress, earn achievements, and unlock career development opportunities through an interactive Battle Pass system with dynamic tier ranking, real-time trackable badges, live Google Sheets integration, and **automatic data cleansing**.

## ✨ What's New - Automatic Data Cleansing

**Data Quality Guaranteed** - All sign-in data is automatically cleansed on load:
- ✅ **Event types standardized** by date (majority voting)
- ✅ **Duplicate sign-ins removed** (same person, same date)
- ✅ **Accurate point calculations** from clean data
- 📊 **Real-time monitoring** in Admin Dashboard

See [DATA_CLEANSING.md](DATA_CLEANSING.md) for details.

## 🚀 Features

### 🎯 **Core Functionality**
- **Dynamic Tier System** - Quartile-based competitive ranking (Gold, Silver, Bronze, Participant)
- **Real-time Trackable Badges** - Achievement system with live progress tracking
- **Automatic Data Cleansing** - Ensures accurate points through event standardization and deduplication
- **Local Data Management** - Complete Google Sheets integration with local calculations
- **Smart Leaderboard** - Live ranking with tier thresholds and member statistics
- **User Recognition** - Personal progress tracking with tier placement

### 🏅 **Advanced Badge System**
- **Trackable Achievements** - Real-time progress monitoring for all badge requirements
- **Dynamic Tier Badges** - Special achievements based on leaderboard quartile performance
- **Category-based Tracking** - Professional Development, Engagement, P-Zone, Mentorship events
- **Progress Visualization** - See completion percentage and next milestone requirements

### 🔥 **Mentorship Hub (Modular)**
- **NSBE Mentoring** - Program details and sign-up portal
- **Professional Development** - Resume resources and interview prep  
- **Academic Corner** - Study resources and academic support
- **Interactive Filters** - Navigate between different development areas

### 📊 **Data Integration & Architecture**
- **AutoCleanse™ System** - Automatic data cleansing on every load (event standardization + deduplication)
- **LocalDataManager** - Centralized data processing with Google Sheets API
- **Live Sheet Integration** - Real-time data from Google Forms with CSV fallback
- **Dynamic Tier Calculation** - Automatic quartile-based tier assignment
- **Enhanced Event Parsing** - Flexible header matching for robust data processing
- **Data Quality Dashboard** - Real-time cleansing statistics in Admin Panel
- **Modular Components** - InfoSidebar, MentorshipHUB, and reusable UI components

## 🛠️ Tech Stack

- **Frontend**: React 18 (via CDN), HTML5, CSS3
- **Architecture**: Modular component system with LocalDataManager + DataCleanser
- **Styling**: Tailwind CSS, Custom CSS animations
- **Data Processing**: Google Sheets API with automatic cleansing and dynamic tier system
- **Badge System**: Real-time trackable achievements with progress monitoring
- **Data Quality**: Automated event standardization and duplicate removal
- **Deployment**: GitHub Pages optimized
- **Development**: Live Server, Modern JavaScript (ES6+)

## 📦 Installation & Setup

### **Prerequisites**
- Web browser with JavaScript enabled
- Live Server or Python HTTP server (for development)
- Google Sheets with public access

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/yourusername/nsbe-uofm-battle-pass-2.git
cd nsbe-uofm-battle-pass-2

# Start development server
python -m http.server 8080

# Visit the application
# Main App: http://localhost:8080
# Admin Dashboard: http://localhost:8080/admin-dashboard.html
# Data Cleansing Test: http://localhost:8080/test-cleansing.html
```

### **Google Sheets Setup**
1. **Sign-in Form Sheet**: Create a form that logs event attendance
2. **Paid Members Sheet**: Maintain a list of current paid NSBE members
3. **Make sheets publicly accessible** for read-only access
4. **Update sheet IDs** in `src/LocalDataManager.js`:
   ```javascript
   SIGNIN_FORM_SHEET_ID: 'your-form-sheet-id',
   PAID_MEMBERS_SHEET_ID: 'your-members-sheet-id'
   ```

## 🎮 Usage

### **For Students**
1. **Enter your uniqname** to see your progress, tier, and rank
2. **View trackable badges** - See real-time progress on all achievements
3. **Check dynamic leaderboard** - See quartile-based tier rankings
4. **Monitor tier placement** - Track your position in Gold, Silver, Bronze, or Participant tiers
5. **Access mentorship resources** - Explore development opportunities

### **For Administrators**
1. **Monitor Google Sheets** - Form responses automatically update member points
2. **Track engagement metrics** - View participation through dynamic leaderboard
3. **Manage tier thresholds** - Automatic quartile calculation adjusts competition
4. **Badge system oversight** - All achievements calculate automatically from attendance data
5. **Test Suite Validation** - Use comprehensive test suite to verify system functionality
6. **Admin Dashboard** - Complete data visualization and member management interface

## 🏗️ Project Structure

```
nsbe-uofm-battle-pass-2/
├── index.html                  # Main application entry point
├── admin-dashboard.html       # Administrative data visualization dashboard
├── test-suite.html            # Comprehensive testing framework
├── test-server.py             # Development server
├── event_data.csv             # Event attendance data
├── src/                       # Application source code
│   ├── app-optimized.js       # Main React application with dynamic tier integration
│   ├── LocalDataManager.js    # Core data processing and Google Sheets integration
│   ├── MentorshipHUB.js      # Trackable badge system and mentorship features
│   ├── InfoSidebar.js        # Modular info sidebar component
│   ├── AdminPanel.js         # Administrative functionality
│   ├── Data-Constants.js     # Centralized configuration and badge definitions
│   ├── Shared-style.js       # Common styling utilities
│   └── helpers.js            # Utility functions
├── tailwind.config.js         # Tailwind CSS configuration
├── CNAME                      # Custom domain configuration
└── LICENSE                    # MIT License
```

### **Key Components**
- **LocalDataManager**: Handles all Google Sheets integration and dynamic tier calculations
- **MentorshipHUB**: Manages trackable badge system with real-time progress
- **InfoSidebar**: Modular component for information display
- **Dynamic Tier System**: Automatic quartile-based competitive ranking


## ⚙️ Configuration & Customization

### **Dynamic Tier System**
The tier system automatically calculates quartile-based rankings:
```javascript
// In LocalDataManager.js - automatically calculated
Gold Tier: Top 25% of members
Silver Tier: 25th-50th percentile  
Bronze Tier: 50th-75th percentile
Participant Tier: Bottom 25%
```

### **Badge System Configuration**
Add new trackable badges in `src/Data-Constants.js`:
```javascript
window.TRACKABLE_BADGES_CONFIG = {
  "badge-id": {
    name: "Badge Name",
    icon: "🏆", 
    color: "#3b82f6",
    desc: "Badge description",
    xp: 25,
    category: "engagement",
    type: "count", // or "status", "tier"
    requirement: { field: "event_type", value: 5 }
  }
};
```

### **Google Sheets Data Sources**
Update sheet configuration in `src/LocalDataManager.js`:
```javascript
window.NEW_DATA_CONFIG = {
  SIGNIN_FORM_SHEET_ID: 'your-form-sheet-id',
  PAID_MEMBERS_SHEET_ID: 'your-members-sheet-id',
  SIGNIN_SHEET_NAME: 'Form Responses 1',
  PAID_MEMBERS_SHEET_NAME: 'Sheet1'
};
```

### **Point System**
Customize event point values in `src/LocalDataManager.js`:
```javascript
window.NEW_POINT_SYSTEM = {
  activities: {
    'GBM': 7,
    'Professional Development': 10,
    'P-Zone': 5,
    'Mentorship Events': 7
  },
  bonuses: {
    'paid_member_multiplier': 1.5
  }
};
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
- Verify all changes work correctly
- Update documentation as needed
- Ensure mobile responsiveness
- Maintain accessibility standards

## 📋 Roadmap

### **Recently Completed ✅**
- [x] Dynamic quartile-based tier system
- [x] Real-time trackable badge system  
- [x] Complete Google Sheets integration with local processing
- [x] Modular component architecture (InfoSidebar, MentorshipHUB)
- [x] Production-ready codebase cleanup
- [x] Clean project structure optimized for deployment

### **Version 2.1 (In Progress)**
- [ ] Enhanced badge progress visualization
- [ ] Tier achievement celebrations and animations
- [ ] Advanced leaderboard filtering options
- [ ] Historical progress tracking

### **Future Enhancements**
- [ ] Push notifications for tier changes
- [ ] Social features (peer comparisons)
- [ ] Advanced analytics dashboard for administrators
- [ ] Integration with University career services

## 🐛 Known Issues & Limitations

- **Performance**: Large datasets (500+ members) may experience slight delays during tier calculation
- **Browser Support**: Requires modern browsers with ES6+ support (IE not supported)
- **Real-time Updates**: Google Sheets API has rate limits; very frequent updates may be delayed
- **Badge Progress**: Some complex badge requirements may need manual verification

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **Development Team**
- **Lead Developer**: [Jaleel Drones](https://github.com/JaleelADA) - Full-stack development, architecture design
- **NSBE UofM Chapter**: Mentorship program design and requirements
- **System Architecture**: Dynamic tier system, trackable badge implementation, modular components

### **Technical Achievements**
- **Dynamic Tier System**: Quartile-based competitive ranking with real-time calculation
- **Trackable Badge System**: Live progress monitoring with Google Sheets integration
- **Modular Architecture**: Scalable component system for easy maintenance and updates
- **Production Optimization**: Clean, efficient codebase with proper separation of concerns

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
- **P-Zone**: Professional development workshops, Academic excellence tips
- **M-Zone**: Mentorship program coordination

---

<div align="center">

**Built with ❤️ for NSBE UofM | Empowering Excellence Through Dynamic Competition**

**🏆 Dynamic Tiers • 🏅 Trackable Badges • 📊 Real-time Data**

[🔗 Live site](https://nsbeum.live) • [📧 Contact](mailto:jaleeldrones1@gmail.com) • [🐛 Report Bug](https://github.com/JaleelADA/nsbe-uofm-battle-pass/issues)

</div>
