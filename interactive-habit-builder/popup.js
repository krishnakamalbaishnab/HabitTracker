// Enhanced Popup Script for Habit Tracker
let currentData = {};

// Initialize popup when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  updateAllStats();
  loadSettings();
  
  // Refresh data every 10 seconds when popup is open
  setInterval(updateAllStats, 10000);
});

// Tab switching functionality
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab content
  document.getElementById(tabName).classList.add('active');
  
  // Add active class to clicked tab
  event.target.classList.add('active');
  
  // Load specific tab data
  if (tabName === 'progress') {
    updateProgressTab();
  } else if (tabName === 'achievements') {
    updateAchievementsTab();
  }
}

// Main stats update function
function updateAllStats() {
  chrome.storage.local.get(null, (data) => {
    currentData = data;
    updateOverviewTab(data);
    updateHeader(data);
  });
}

// Update header with points and level
function updateHeader(data) {
  document.getElementById('pointsDisplay').textContent = data.points || 0;
  document.getElementById('levelDisplay').textContent = data.level || 1;
}

// Update overview tab
function updateOverviewTab(data) {
  const today = new Date().toDateString();
  const todayStats = data.dailyStats && data.dailyStats[today] ? data.dailyStats[today] : {};
  
  // Calculate category times
  const categoryTimes = {};
  let totalTime = 0;
  
  for (const [category, domains] of Object.entries(todayStats)) {
    const categoryTotal = Object.values(domains).reduce((a, b) => a + b, 0);
    categoryTimes[category] = Math.round(categoryTotal / 60); // Convert to minutes
    totalTime += categoryTotal;
  }
  
  // Update category displays
  document.getElementById('socialTime').textContent = `${categoryTimes.socialMedia || 0}m`;
  document.getElementById('entertainmentTime').textContent = `${categoryTimes.entertainment || 0}m`;
  document.getElementById('newsTime').textContent = `${categoryTimes.news || 0}m`;
  document.getElementById('totalTime').textContent = `${Math.round(totalTime / 60)}m`;
  
  // Update streak display
  const streaks = data.streaks || { current: 0 };
  document.getElementById('streakDisplay').textContent = streaks.current || 0;
  
  // Update goals progress
  updateGoalsProgress(data, categoryTimes);
}

// Update goals progress section
function updateGoalsProgress(data, categoryTimes) {
  const goals = data.goals || { socialMedia: 60, entertainment: 120, news: 30 };
  const progressContainer = document.getElementById('goalsProgress');
  
  progressContainer.innerHTML = '';
  
  for (const [category, goalMinutes] of Object.entries(goals)) {
    const timeSpent = categoryTimes[category] || 0;
    const percentage = Math.min((timeSpent / goalMinutes) * 100, 100);
    
    const progressHTML = `
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress ${getProgressClass(percentage)}" style="width: ${percentage}%"></div>
        </div>
        <div class="progress-text">
          <span>${formatCategoryName(category)}</span>
          <span>${timeSpent}/${goalMinutes}m</span>
        </div>
      </div>
    `;
    
    progressContainer.innerHTML += progressHTML;
  }
}

// Get progress bar class based on percentage
function getProgressClass(percentage) {
  if (percentage >= 100) return 'danger';
  if (percentage >= 80) return 'warning';
  return '';
}

// Format category names for display
function formatCategoryName(category) {
  switch (category) {
    case 'socialMedia': return 'Social Media';
    case 'entertainment': return 'Entertainment';
    case 'news': return 'News';
    default: return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

// Update progress tab with weekly data
function updateProgressTab() {
  updateWeeklyChart();
  updateDetailedStats();
}

// Create weekly chart visualization
function updateWeeklyChart() {
  const chartContainer = document.getElementById('weeklyChart');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  chartContainer.innerHTML = '';
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();
    
    const dayStats = currentData.dailyStats && currentData.dailyStats[dateString] 
      ? currentData.dailyStats[dateString] : {};
    
    let totalMinutes = 0;
    for (const category of Object.values(dayStats)) {
      totalMinutes += Object.values(category).reduce((a, b) => a + b, 0) / 60;
    }
    
    const maxHeight = 40;
    const height = Math.min((totalMinutes / 120) * maxHeight, maxHeight); // Normalize to 2 hours max
    
    const dayHTML = `
      <div class="day-bar">
        <div class="day-progress" style="height: ${height}px;" title="${Math.round(totalMinutes)}m on ${date.toLocaleDateString()}"></div>
        <div class="day-label">${days[date.getDay()]}</div>
      </div>
    `;
    
    chartContainer.innerHTML += dayHTML;
  }
}

// Update detailed statistics
function updateDetailedStats() {
  const statsContainer = document.getElementById('detailedStats');
  const today = new Date().toDateString();
  const todayStats = currentData.dailyStats && currentData.dailyStats[today] 
    ? currentData.dailyStats[today] : {};
  
  let detailsHTML = '';
  
  for (const [category, domains] of Object.entries(todayStats)) {
    const categoryTotal = Object.values(domains).reduce((a, b) => a + b, 0);
    
    if (categoryTotal > 0) {
      detailsHTML += `<h4 style="margin: 15px 0 5px 0; color: #4CAF50;">${formatCategoryName(category)}</h4>`;
      
      for (const [domain, seconds] of Object.entries(domains)) {
        const minutes = Math.round(seconds / 60);
        if (minutes > 0) {
          detailsHTML += `
            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
              <span style="font-size: 13px;">${domain}</span>
              <span style="font-size: 13px; color: #666;">${minutes}m</span>
            </div>
          `;
        }
      }
    }
  }
  
  if (!detailsHTML) {
    detailsHTML = '<div style="text-align: center; color: #666; padding: 20px;">No data for today yet.</div>';
  }
  
  statsContainer.innerHTML = detailsHTML;
}

// Update achievements tab
function updateAchievementsTab() {
  const achievementsList = document.getElementById('achievementsList');
  const achievements = generateAchievements(currentData);
  
  if (achievements.length === 0) {
    achievementsList.innerHTML = `
      <div style="text-align: center; color: #666; padding: 20px;">
        Complete goals to unlock achievements!
      </div>
    `;
    return;
  }
  
  let achievementsHTML = '';
  achievements.forEach(achievement => {
    achievementsHTML += `
      <div class="achievement">
        <div class="achievement-icon">${achievement.icon}</div>
        <div>
          <div style="font-weight: bold; font-size: 14px;">${achievement.title}</div>
          <div style="font-size: 12px; color: #666;">${achievement.description}</div>
        </div>
      </div>
    `;
  });
  
  achievementsList.innerHTML = achievementsHTML;
}

// Generate achievements based on user data
function generateAchievements(data) {
  const achievements = [];
  const streaks = data.streaks || { current: 0, longest: 0 };
  const points = data.points || 0;
  const level = data.level || 1;
  
  // Streak achievements
  if (streaks.longest >= 7) {
    achievements.push({
      icon: '🔥',
      title: 'Week Warrior',
      description: 'Met your goals for 7 days straight!'
    });
  }
  
  if (streaks.longest >= 30) {
    achievements.push({
      icon: '👑',
      title: 'Habit Master',
      description: 'Met your goals for 30 days straight!'
    });
  }
  
  // Points achievements
  if (points >= 100) {
    achievements.push({
      icon: '⭐',
      title: 'First Century',
      description: 'Earned your first 100 points!'
    });
  }
  
  if (points >= 500) {
    achievements.push({
      icon: '🏆',
      title: 'Point Master',
      description: 'Earned 500 points!'
    });
  }
  
  // Level achievements
  if (level >= 5) {
    achievements.push({
      icon: '🚀',
      title: 'Rising Star',
      description: 'Reached level 5!'
    });
  }
  
  if (level >= 10) {
    achievements.push({
      icon: '💎',
      title: 'Elite Tracker',
      description: 'Reached level 10!'
    });
  }
  
  return achievements;
}

// Load and display current settings
function loadSettings() {
  chrome.storage.local.get(['goals', 'notifications'], (data) => {
    const goals = data.goals || { socialMedia: 60, entertainment: 120, news: 30 };
    
    document.getElementById('socialGoal').value = goals.socialMedia;
    document.getElementById('entertainmentGoal').value = goals.entertainment;
    document.getElementById('newsGoal').value = goals.news;
    document.getElementById('notificationsEnabled').checked = data.notifications !== false;
  });
}

// Save settings
function saveSettings() {
  const goals = {
    socialMedia: parseInt(document.getElementById('socialGoal').value),
    entertainment: parseInt(document.getElementById('entertainmentGoal').value),
    news: parseInt(document.getElementById('newsGoal').value)
  };
  
  const notifications = document.getElementById('notificationsEnabled').checked;
  
  chrome.storage.local.set({ goals, notifications }, () => {
    showMessage('Settings saved successfully!', 'success');
    updateAllStats(); // Refresh display with new goals
  });
}

// Export data functionality
function exportData() {
  chrome.runtime.sendMessage({ action: 'exportData' }, (response) => {
    if (response.success) {
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `habit-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      showMessage('Data exported successfully!', 'success');
    }
  });
}

// Import data functionality
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          chrome.runtime.sendMessage({ action: 'importData', data }, (response) => {
            if (response.success) {
              showMessage('Data imported successfully!', 'success');
              updateAllStats();
            }
          });
        } catch (error) {
          showMessage('Invalid file format!', 'error');
        }
      };
      reader.readAsText(file);
    }
  };
  
  input.click();
}

// Reset all data
function resetData() {
  if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
    chrome.runtime.sendMessage({ action: 'resetData' }, (response) => {
      if (response.success) {
        showMessage('All data has been reset!', 'success');
        updateAllStats();
        loadSettings();
      }
    });
  }
}

// Show temporary message to user
function showMessage(text, type = 'info') {
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    border-radius: 5px;
    font-size: 12px;
    z-index: 1000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  message.textContent = text;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    document.body.removeChild(message);
  }, 3000);
}

// Utility function to format time
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

// Make functions globally available
window.switchTab = switchTab;
window.saveSettings = saveSettings;
window.exportData = exportData;
window.importData = importData;
window.resetData = resetData; 