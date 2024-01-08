// renderer.js
const { ipcRenderer } = require('electron');

window.onload = () => {
  ipcRenderer.on('image-loaded', (event, { imageUrl, videoUrl, dimmingDetailsUrl }) => {
    render(imageUrl);
    playVideo(videoUrl);
    loadDimmingDetails(dimmingDetailsUrl);
  });
};

function render(imageUrl) {
  const resultImage = document.getElementById('resultImage');

  // Set the desired width and height for the image
  resultImage.width = 720; // Replace with your preferred width
  resultImage.height = 720; // Replace with your preferred height

  resultImage.src = imageUrl;
}

function playVideo(videoUrl) {
  // Prepend 'file://' to the local file path
  const formattedVideoUrl = 'file://' + videoUrl;

  const videoPlayer = document.getElementById('videoPlayer');
  videoPlayer.src = formattedVideoUrl;

  // Set the desired width and height for the video player
  videoPlayer.width = 720; // Replace with your preferred width
  videoPlayer.height = 720; // Replace with your preferred height

  videoPlayer.play();

  videoPlayer.addEventListener('error', (event) => {
    console.error('Video error:', event);
    console.error('Media error code:', videoPlayer.error.code);
    console.error('Media error message:', videoPlayer.error.message);
  });
}

function loadDimmingDetails(dimmingDetailsUrl) {
  // Fetch dimming details HTML content
  fetch(dimmingDetailsUrl)
    .then(response => response.text())
    .then(html => {
      console.log('Dimming Details HTML:', html); // Log the entire HTML content

      // Inject the HTML into a container element
      const dimmingContainer = document.getElementById('dimmingContainer');
      dimmingContainer.innerHTML = html;

      // Extract the image URL from the loaded HTML
      const moveJPEGImage = document.getElementById('moveJPEG');

      if (moveJPEGImage) {
        // Create an img element for the dimming image
        const dimmingImage = document.createElement('img');
        dimmingImage.src = moveJPEGImage.src;

        // Append the dimming image to the container
        dimmingContainer.appendChild(dimmingImage);
      } else {
        console.error('Element with id "moveJPEG" not found in dimming details.');
      }
    })
    .catch(error => console.error('Error loading dimming details:', error));
}

  