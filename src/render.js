// renderer.js
const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.on('image-loaded', (event, { imageUrl, videoUrl }) => {
      render(imageUrl);
      playVideo(videoUrl);
    });
  });
  
  function render(imageUrl) {
    document.getElementById('resultImage').src = imageUrl;
  }
  
  function playVideo(videoUrl) {
    // Assuming you have a video element with id 'videoPlayer'
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.src = videoUrl;
    videoPlayer.play();
  }
  