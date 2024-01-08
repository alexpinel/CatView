// renderer.js
const { ipcRenderer } = require('electron');

window.onload = () => {
  ipcRenderer.on('image-loaded', (event, { imageUrl, videoUrl }) => {
      render(imageUrl);
      playVideo(videoUrl);
  });
};
  
  function render(imageUrl) {
    document.getElementById('resultImage').src = imageUrl;
  }

  function playVideo(videoUrl) {
    // Prepend 'file://' to the local file path
    const formattedVideoUrl = 'file://' + videoUrl;

    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.src = formattedVideoUrl;

    // Set the desired width and height for the video player
    videoPlayer.width = 320; // Replace with your preferred width
    videoPlayer.height = 180; // Replace with your preferred height

    videoPlayer.play();

    videoPlayer.addEventListener('error', (event) => {
        console.error('Video error:', event);
        console.error('Media error code:', videoPlayer.error.code);
        console.error('Media error message:', videoPlayer.error.message);
    });
}

  