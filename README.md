# 🏆 Interactive Habit Builder

An advanced Chrome extension that gamifies your browsing habits by tracking time spent on different websites and helping you build healthier digital habits through goal setting, achievements, and detailed analytics.

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-extension-orange.svg)

## ✨ Features

### 📊 Smart Tracking
- **Categorized Monitoring**: Automatically categorizes websites into Social Media, Entertainment, and News
- **Real-time Tracking**: Tracks active tab usage with precision (minimum 5-second sessions)
- **Focus-aware**: Pauses tracking when browser loses focus
- **Multiple Domains**: Tracks major platforms including Facebook, Twitter, Instagram, YouTube, Reddit, Netflix, and more

### 🎯 Goal Management
- **Customizable Goals**: Set daily time limits for each category
- **Visual Progress**: Real-time progress bars with color-coded warnings
- **Smart Notifications**: Alerts when approaching (80%) or exceeding goals
- **Flexible Limits**: Set goals from 1 to 480 minutes per category

### 🏅 Gamification System
- **Points & Levels**: Earn points for meeting goals, level up every 100 points
- **Streak Tracking**: Build daily streaks by consistently meeting all goals
- **Achievement System**: Unlock achievements for milestones and consistency
- **Visual Rewards**: Beautiful UI with progress celebrations

### 📈 Advanced Analytics
- **Daily Overview**: Category-wise breakdown with visual summaries
- **Weekly Charts**: 7-day visualization of usage patterns
- **Detailed Statistics**: Domain-level time tracking and analysis
- **Historical Data**: Automatic weekly data archiving

### ⚙️ Powerful Settings
- **Customizable Notifications**: Toggle system notifications on/off
- **Data Management**: Export/import data for backup and migration
- **Complete Reset**: Start fresh with one-click data clearing
- **Persistent Storage**: All data stored locally for privacy

## 🚀 Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download the Extension**
   ```bash
   git clone https://github.com/krishnakamalbaishnab/HabitTracker.git
   cd HabitTracker
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `interactive-habit-builder` folder
   - The extension icon should appear in your toolbar

### Method 2: Chrome Web Store (Coming Soon)
The extension will be published to the Chrome Web Store for easy installation.

## 📱 Usage Guide

### First Launch
1. Click the extension icon in your toolbar
2. The extension will initialize with default goals:
   - Social Media: 60 minutes/day
   - Entertainment: 120 minutes/day
   - News: 30 minutes/day

### Navigating the Interface

#### 🏠 Overview Tab
- **Today's Summary**: Visual cards showing time spent in each category
- **Streak Counter**: Current consecutive days meeting all goals
- **Goals Progress**: Real-time progress bars for each category

#### 📊 Progress Tab
- **Weekly Chart**: 7-day visualization of your usage patterns
- **Detailed Statistics**: Breakdown by individual websites and domains

#### 🏆 Achievements Tab
- **Unlocked Rewards**: View all earned achievements
- **Progress Tracking**: See what milestones you're working toward

#### ⚙️ Settings Tab
- **Goal Customization**: Adjust daily limits for each category
- **Notification Preferences**: Enable/disable system alerts
- **Data Management**: Export, import, or reset your data

### Achievement System

| Achievement | Requirement | Reward |
|-------------|-------------|---------|
| 🔥 Week Warrior | 7-day streak | Pride and motivation! |
| 👑 Habit Master | 30-day streak | Ultimate consistency |
| ⭐ First Century | 100 points earned | First major milestone |
| 🏆 Point Master | 500 points earned | Dedication recognized |
| 🚀 Rising Star | Reach level 5 | Consistent improvement |
| 💎 Elite Tracker | Reach level 10 | Mastery achieved |

### Data Management

#### Export Data
- Click "Export Data" in Settings
- Downloads a JSON file with all your tracking data
- Use for backup or migration to other devices

#### Import Data
- Click "Import Data" in Settings
- Select a previously exported JSON file
- All data will be restored and merged

#### Reset Data
- Click "Reset All Data" for a fresh start
- **Warning**: This action cannot be undone!

## 🔧 Technical Details

### Permissions
- `storage`: Store tracking data and settings locally
- `tabs`: Monitor active tab changes
- `webNavigation`: Track navigation events
- `alarms`: Schedule daily reset operations
- `notifications`: Display goal-related alerts
- `<all_urls>`: Access to all websites for tracking

### Data Structure
```javascript
{
  dailyStats: {
    "date": {
      "category": {
        "domain.com": timeInSeconds
      }
    }
  },
  weeklyStats: {},
  points: number,
  level: number,
  goals: {
    socialMedia: minutes,
    entertainment: minutes,
    news: minutes
  },
  streaks: {
    current: number,
    longest: number,
    lastGoalMet: "date"
  },
  notifications: boolean
}
```

### Tracked Domains by Category

#### Social Media
- Facebook (facebook.com, fb.com)
- Twitter/X (twitter.com, x.com)
- Instagram (instagram.com)
- TikTok (tiktok.com)
- Snapchat (snapchat.com)
- LinkedIn (linkedin.com)

#### Entertainment
- YouTube (youtube.com)
- Netflix (netflix.com)
- Twitch (twitch.tv)
- Reddit (reddit.com)

#### News
- CNN (cnn.com)
- BBC (bbc.com)
- New York Times (nytimes.com)
- Reuters (reuters.com)

## 🛠️ Development

### Project Structure
```
HabitTracker/
├── interactive-habit-builder/
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Service worker for tracking
│   ├── popup.html            # Extension popup interface
│   ├── popup.js              # Popup functionality
│   └── icons/                # Extension icons
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── create-icons.html         # Icon generation utility
└── README.md                # Documentation
```

### Key Components

#### Background Script (`background.js`)
- Tracks active tabs and time spent
- Manages alarms for daily resets
- Handles notifications and goal checking
- Provides data export/import functionality

#### Popup Interface (`popup.html` + `popup.js`)
- Tabbed interface for different views
- Real-time data visualization
- Settings management
- Achievement system display

#### Manifest (`manifest.json`)
- Chrome extension configuration
- Permissions and metadata
- Service worker registration

### Building and Testing

1. **Make Code Changes**
   ```bash
   # Edit files in interactive-habit-builder/
   ```

2. **Reload Extension**
   - Go to `chrome://extensions/`
   - Click the refresh icon on your extension
   - Test functionality

3. **Debug Issues**
   - Open Chrome DevTools for popup: Right-click extension → "Inspect popup"
   - Check service worker: Go to extension details → "Inspect views: service worker"

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues
1. Check existing issues first
2. Use the issue template
3. Include browser version and steps to reproduce

### Feature Requests
1. Open an issue describing the feature
2. Explain the use case and benefits
3. Consider implementation complexity

### Code Contributions
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request with detailed description

### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex logic
- Test all functionality before submitting
- Update documentation if needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extensions team for excellent documentation
- Icons and UI inspiration from modern web design trends
- Community feedback and feature suggestions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/krishnakamalbaishnab/HabitTracker/issues)
- **Documentation**: This README and inline code comments
- **Feature Requests**: Open an issue with the "enhancement" label

## 🗺️ Roadmap

### Upcoming Features
- [ ] Custom domain tracking
- [ ] Weekly/monthly goal setting
- [ ] Data visualization charts
- [ ] Productivity site detection
- [ ] Team/family sharing features
- [ ] Integration with other productivity tools

### Version History
- **v2.0.0**: Major UI overhaul, enhanced tracking, achievement system
- **v1.0.0**: Basic time tracking and goal setting

---

**Made with ❤️ for digital wellness**

Start building better browsing habits today! 🚀 