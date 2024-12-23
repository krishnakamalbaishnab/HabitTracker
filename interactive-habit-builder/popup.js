document.addEventListener('DOMContentLoaded', () => {
  updateStats();
});

function updateStats() {
  chrome.storage.local.get(['dailyStats', 'points', 'goals'], (data) => {
    const today = new Date().toDateString();
    const dailyStats = data.dailyStats[today] || {};
    
    // Calculate total time spent today in minutes
    const totalMinutes = Object.values(dailyStats).reduce((a, b) => a + b, 0) / 60;
    
    // Update the display
    document.getElementById('pointsDisplay').textContent = data.points || 0;
    document.getElementById('timeSpent').textContent = Math.round(totalMinutes);
    document.getElementById('goalTime').textContent = data.goals.socialMedia;
    
    // Update progress bar
    const progress = Math.min((totalMinutes / data.goals.socialMedia) * 100, 100);
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    // Change progress bar color based on progress
    const progressBar = document.getElementById('progressBar');
    if (progress > 100) {
      progressBar.style.backgroundColor = '#ff4444';
    } else {
      progressBar.style.backgroundColor = '#4CAF50';
    }
  });
} 