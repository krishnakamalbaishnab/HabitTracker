// Store for tracking active tabs and their timing
let activeTabData = {
  startTime: null,
  url: null
};

// List of domains to track (can be customized)
const trackedDomains = [
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'youtube.com'
];

// Initialize storage with default values
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    dailyStats: {},
    points: 0,
    goals: {
      socialMedia: 60 // default 60 minutes per day
    }
  });
});

// Track when tabs are activated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  handleTabChange(tab);
});

// Track when tabs are updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    handleTabChange(tab);
  }
});

function handleTabChange(tab) {
  if (activeTabData.startTime) {
    updateTimeSpent();
  }
  
  const domain = new URL(tab.url).hostname;
  if (trackedDomains.some(td => domain.includes(td))) {
    activeTabData = {
      startTime: Date.now(),
      url: domain
    };
  } else {
    activeTabData = { startTime: null, url: null };
  }
}

function updateTimeSpent() {
  const endTime = Date.now();
  const timeSpent = Math.round((endTime - activeTabData.startTime) / 1000);
  
  chrome.storage.local.get(['dailyStats', 'points', 'goals'], (data) => {
    const today = new Date().toDateString();
    const dailyStats = data.dailyStats || {};
    dailyStats[today] = dailyStats[today] || {};
    dailyStats[today][activeTabData.url] = (dailyStats[today][activeTabData.url] || 0) + timeSpent;

    // Check if user is under their goal and award points
    const totalMinutes = Object.values(dailyStats[today]).reduce((a, b) => a + b, 0) / 60;
    if (totalMinutes < data.goals.socialMedia) {
      data.points += 1;
    }

    chrome.storage.local.set({
      dailyStats: dailyStats,
      points: data.points
    });
  });
} 