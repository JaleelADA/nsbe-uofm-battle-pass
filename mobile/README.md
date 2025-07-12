# NSBE UofM Battle Pass - Mobile App

A React Native mobile application for the NSBE University of Michigan Battle Pass system. This app provides a mobile-optimized interface for tracking progress, viewing leaderboards, and staying updated with NSBE events.

## 🚀 Features

### 📱 Mobile-Optimized Dashboard
- **User Search**: Find any student in the complete leaderboard database
- **Progress Tracking**: View XP points, tier status, and rank
- **Badge System**: Visual representation of achievement levels
- **Real-time Data**: Live integration with Google Sheets leaderboard

### 🏆 Leaderboard
- **Top 10 Display**: Shows the top performing members by default
- **Full Search**: Search and find ANY user in the complete database (not just top 10)
- **User Highlighting**: Your position is highlighted when found
- **Tier Visualization**: Badge icons and tier information for each user

### 📅 Events & Announcements
- **Upcoming Events**: View NSBE events with dates, times, and locations
- **Important Links**: Quick access to NSBE resources and sign-ups
- **Mobile-Friendly**: Optimized for touch interaction and mobile viewing

## 🛠️ Tech Stack

- **Framework**: React Native 0.73.4
- **Language**: JavaScript (ES6+)
- **Data Source**: Google Sheets API (CSV export)
- **Navigation**: Built-in React Native components
- **Styling**: StyleSheet with custom theme system

## 📦 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **React Native CLI**: `npm install -g react-native-cli`

#### For iOS Development:
- **Xcode** (latest version)
- **iOS Simulator** or physical iOS device
- **CocoaPods**: `sudo gem install cocoapods`

#### For Android Development:
- **Android Studio** with Android SDK
- **Java Development Kit (JDK)** 11 or higher
- **Android Virtual Device (AVD)** or physical Android device

### Setup Instructions

1. **Navigate to the mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **For iOS (macOS only)**:
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start the Metro bundler**:
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run on your target platform**:

   **For iOS:**
   ```bash
   npm run ios
   # or
   yarn ios
   ```

   **For Android:**
   ```bash
   npm run android
   # or
   yarn android
   ```

### Development Setup

1. **Enable Developer Mode** on your physical device (if using):
   - **iOS**: Connect device and trust computer in Xcode
   - **Android**: Enable USB Debugging in Developer Options

2. **Environment Setup**:
   - Ensure your development machine and device are on the same network
   - The app will automatically connect to the Google Sheets data source

## 🎮 Usage

### For Students

1. **Search for Your Profile**:
   - Open the app and enter your full name in the search field
   - Tap "Search" to find your profile and current rank

2. **View Your Progress**:
   - See your XP points, tier status, and current rank
   - Check which badges you've earned based on your tier

3. **Explore the Leaderboard**:
   - View top 10 performers by default
   - Search for any specific user in the complete database
   - Your position will be highlighted when found

4. **Stay Updated**:
   - Check upcoming NSBE events with details
   - Access important announcements and links

### For Administrators

The mobile app automatically syncs with the same Google Sheets data source as the web application. No additional setup is required - just update the spreadsheet and changes will be reflected in the mobile app.

## 📱 App Structure

```
mobile/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── UserStats.js     # User progress display
│   │   ├── Leaderboard.js   # Full leaderboard with search
│   │   ├── Events.js        # Events listing
│   │   ├── Announcements.js # Announcements and links
│   │   └── Badges.js        # Achievement badges
│   ├── services/            # Data and API services
│   │   └── googleSheetsService.js  # Google Sheets integration
│   ├── styles/              # Styling and theme
│   │   └── theme.js         # App theme and common styles
│   ├── utils/               # Utility functions and data
│   │   └── staticData.js    # Static app data
│   └── App.js               # Main app component
├── android/                 # Android-specific files
├── ios/                     # iOS-specific files
├── index.js                 # App entry point
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🎨 Customization

### Theme Colors
Edit `src/styles/theme.js` to customize the app's color scheme:

```javascript
export const theme = {
  colors: {
    primary: '#4CAF50',      // NSBE Green
    secondary: '#FFD700',    // NSBE Gold
    accent: '#2196F3',       // NSBE Blue
    // ... other colors
  }
};
```

### Data Source
The app uses the same Google Sheets integration as the web version. The sheet ID is configured in `src/services/googleSheetsService.js`.

## 🔧 Available Scripts

- **`npm start`**: Start the Metro bundler
- **`npm run ios`**: Run on iOS simulator/device
- **`npm run android`**: Run on Android emulator/device
- **`npm test`**: Run the test suite
- **`npm run lint`**: Lint the codebase

## 🐛 Troubleshooting

### Common Issues

**Metro bundler won't start:**
```bash
npx react-native start --reset-cache
```

**Build fails on iOS:**
```bash
cd ios && pod install && cd ..
npx react-native run-ios --clean
```

**Build fails on Android:**
```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

**Network request fails:**
- Ensure your device/emulator has internet connectivity
- Check that the Google Sheets are publicly accessible
- Verify the sheet ID in the service configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/mobile-enhancement`
3. Make your changes in the `mobile/` directory
4. Test on both iOS and Android if possible
5. Commit your changes: `git commit -m 'Add mobile enhancement'`
6. Push to the branch: `git push origin feature/mobile-enhancement`
7. Open a Pull Request

### Development Guidelines

- Follow React Native best practices
- Maintain iOS and Android compatibility
- Test on multiple screen sizes
- Ensure accessibility compliance
- Keep bundle size optimized

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 📞 Support

### Technical Issues
- Create an issue on the main repository
- Include device type, OS version, and error details

### NSBE UofM Chapter
- **Website**: [NSBE UofM](https://maizepages.umich.edu/organization/nsbe)
- **Email**: [nsbe.uofm@umich.edu](mailto:nsbe.uofm@umich.edu)

---

**Built with ❤️ for NSBE UofM | Mobile Excellence Through Technology**