// Enhanced Habit Tracker Background Script
// Store for tracking active tabs and their timing
let activeTabData = {
  startTime: null,
  url: null,
  tabId: null
};

// Enhanced list of domains to track with categories
const trackedDomains = {
  socialMedia: [
    'facebook.com', 'fb.com',
    'twitter.com', 'x.com',
    'instagram.com',
    'tiktok.com',
    'snapchat.com',
    'linkedin.com'
  ],
  entertainment: [
    'youtube.com',
    'netflix.com',
    'twitch.tv',
    'reddit.com'
  ],
  news: [
    'cnn.com',
    'bbc.com',
    'nytimes.com',
    'reuters.com'
  ]
};

// All tracked domains flattened
const allTrackedDomains = [
  ...trackedDomains.socialMedia,
  ...trackedDomains.entertainment,
  ...trackedDomains.news
];

// Default settings
const defaultSettings = {
  dailyStats: {},
  weeklyStats: {},
  points: 0,
  level: 1,
  achievements: [],
  goals: {
    socialMedia: 60, // minutes per day
    entertainment: 120,
    news: 30
  },
  notifications: true,
  streaks: {
    current: 0,
    longest: 0,
    lastGoalMet: null
  },
  customDomains: []
};

// Initialize storage with default values
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(null, (data) => {
    const settings = { ...defaultSettings, ...data };
    chrome.storage.local.set(settings);
    
    // Set up daily reset alarm
    chrome.alarms.create('dailyReset', {
      when: getNextMidnight(),
      periodInMinutes: 24 * 60
    });
  });
});

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    handleDailyReset();
  }
});

// Track when tabs are activated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
      handleTabChange(tab);
    }
  } catch (error) {
    console.error('Error handling tab activation:', error);
  }
});

// Track when tabs are updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    handleTabChange(tab);
  }
});

// Track when window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus
    if (activeTabData.startTime) {
      updateTimeSpent();
      activeTabData = { startTime: null, url: null, tabId: null };
    }
  }
});

function handleTabChange(tab) {
  try {
    // Update time for previous tab if it was being tracked
    if (activeTabData.startTime) {
      updateTimeSpent();
    }
    
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      activeTabData = { startTime: null, url: null, tabId: null };
      return;
    }

    const url = new URL(tab.url);
    const domain = url.hostname.replace('www.', '');
    
    // Check if domain should be tracked
    if (shouldTrackDomain(domain)) {
      activeTabData = {
        startTime: Date.now(),
        url: domain,
        tabId: tab.id
      };
    } else {
      activeTabData = { startTime: null, url: null, tabId: null };
    }
  } catch (error) {
    console.error('Error handling tab change:', error);
    activeTabData = { startTime: null, url: null, tabId: null };
  }
}

function shouldTrackDomain(domain) {
  return allTrackedDomains.some(td => domain.includes(td));
}

function getDomainCategory(domain) {
  for (const [category, domains] of Object.entries(trackedDomains)) {
    if (domains.some(td => domain.includes(td))) {
      return category;
    }
  }
  return 'other';
}

function updateTimeSpent() {
  if (!activeTabData.startTime || !activeTabData.url) return;
  
  const endTime = Date.now();
  const timeSpent = Math.round((endTime - activeTabData.startTime) / 1000);
  
  // Only count meaningful time (more than 5 seconds)
  if (timeSpent < 5) return;
  
  chrome.storage.local.get(null, (data) => {
    const today = new Date().toDateString();
    const category = getDomainCategory(activeTabData.url);
    
    // Update daily stats
    const dailyStats = data.dailyStats || {};
    if (!dailyStats[today]) {
      dailyStats[today] = {};
    }
    if (!dailyStats[today][category]) {
      dailyStats[today][category] = {};
    }
    dailyStats[today][category][activeTabData.url] = 
      (dailyStats[today][category][activeTabData.url] || 0) + timeSpent;

    // Calculate points and achievements
    const newData = calculatePointsAndAchievements(data, dailyStats, today, category);
    
    chrome.storage.local.set({
      ...newData,
      dailyStats: dailyStats
    });
    
    // Check for goal violations and send notifications
    checkGoalsAndNotify(newData, today);
  });
}

function calculatePointsAndAchievements(data, dailyStats, today, category) {
  const todayStats = dailyStats[today] || {};
  let points = data.points || 0;
  let level = data.level || 1;
  const achievements = data.achievements || [];
  
  // Calculate total time for each category today
  const categoryTimes = {};
  for (const [cat, domains] of Object.entries(todayStats)) {
    categoryTimes[cat] = Object.values(domains).reduce((a, b) => a + b, 0) / 60; // convert to minutes
  }
  
  // Award points for staying under goals
  const goals = data.goals || defaultSettings.goals;
  let goalsMetToday = 0;
  
  for (const [cat, goalMinutes] of Object.entries(goals)) {
    const timeSpent = categoryTimes[cat] || 0;
    if (timeSpent <= goalMinutes) {
      goalsMetToday++;
    }
  }
  
  // Bonus points for meeting all goals
  if (goalsMetToday === Object.keys(goals).length) {
    points += 10;
    
    // Check for streak achievements
    const streaks = data.streaks || defaultSettings.streaks;
    streaks.current++;
    if (streaks.current > streaks.longest) {
      streaks.longest = streaks.current;
    }
    streaks.lastGoalMet = today;
  } else {
    // Reset streak if goals not met
    const streaks = data.streaks || defaultSettings.streaks;
    streaks.current = 0;
  }
  
  // Calculate level (every 100 points = 1 level)
  level = Math.floor(points / 100) + 1;
  
  return { points, level, achievements, streaks: data.streaks };
}

function checkGoalsAndNotify(data, today) {
  if (!data.notifications) return;
  
  const todayStats = data.dailyStats[today] || {};
  const goals = data.goals || defaultSettings.goals;
  
  for (const [category, goalMinutes] of Object.entries(goals)) {
    const categoryStats = todayStats[category] || {};
    const timeSpent = Object.values(categoryStats).reduce((a, b) => a + b, 0) / 60;
    
    // Warn when approaching goal (80% of limit)
    if (timeSpent >= goalMinutes * 0.8 && timeSpent < goalMinutes) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Habit Tracker Warning',
        message: `You're approaching your ${category} limit for today (${Math.round(timeSpent)}/${goalMinutes} minutes)`
      });
    }
    
    // Warn when goal exceeded
    if (timeSpent > goalMinutes) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Goal Exceeded',
        message: `You've exceeded your ${category} goal for today (${Math.round(timeSpent)}/${goalMinutes} minutes)`
      });
    }
  }
}

function handleDailyReset() {
  chrome.storage.local.get(null, (data) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Move yesterday's data to weekly stats
    const weeklyStats = data.weeklyStats || {};
    const weekKey = getWeekKey(new Date(yesterday));
    
    if (!weeklyStats[weekKey]) {
      weeklyStats[weekKey] = {};
    }
    
    if (data.dailyStats && data.dailyStats[yesterday]) {
      weeklyStats[weekKey][yesterday] = data.dailyStats[yesterday];
    }
    
    chrome.storage.local.set({ weeklyStats });
  });
}

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

function getWeekKey(date) {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week}`;
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Export data functionality
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportData') {
    chrome.storage.local.get(null, (data) => {
      sendResponse({ success: true, data: data });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'importData') {
    chrome.storage.local.set(request.data, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'resetData') {
    chrome.storage.local.clear(() => {
      chrome.storage.local.set(defaultSettings, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
}); 