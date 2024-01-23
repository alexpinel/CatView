// renderer.js
const { ipcRenderer } = require('electron');


document.getElementById('nextImage').addEventListener('click', () => {
  ipcRenderer.send('load-next-image');
});

document.getElementById('previousImage').addEventListener('click', () => {
  ipcRenderer.send('load-previous-image');
});

document.getElementById('goToCustomImage').addEventListener('click', () => {
  const customIndex = document.getElementById('customIndex').value;
  ipcRenderer.send('load-custom-image', parseInt(customIndex, 10));
});


window.onload = () => {
  ipcRenderer.on('image-loaded', (event, { imageUrl, videoUrl, dimmingDetailsUrl }) => {
    render(imageUrl);
    playVideo(videoUrl);
    loadDimmingDetails(dimmingDetailsUrl, '#moveJPEG');
  });
};

function render(imageUrl) {
  const resultImage = document.getElementById('resultImage');

  // Set the desired width and height for the image
  resultImage.width = 600; // Replace with your preferred width
  resultImage.height = 600; // Replace with your preferred height

  resultImage.src = imageUrl;
}

function playVideo(videoUrl) {
  // Prepend 'file://' to the local file path
  const formattedVideoUrl = 'file://' + videoUrl;

  const videoPlayer = document.getElementById('videoPlayer');
  videoPlayer.src = formattedVideoUrl;

  // Set the desired width and height for the video player
  videoPlayer.width = 620; // Replace with your preferred width
  videoPlayer.height = 620; // Replace with your preferred height

  videoPlayer.play();

  videoPlayer.addEventListener('error', (event) => {
    console.error('Video error:', event);
    console.error('Media error code:', videoPlayer.error.code);
    console.error('Media error message:', videoPlayer.error.message);
  });
}




function loadDimmingDetails(dimmingDetailsUrl) {
  // Fetch HTML content from the website
  fetch(dimmingDetailsUrl)
    .then(response => response.text())
    .then(html => {
      // Extract image information from the JavaScript code
      const regex = /JPEG\d\.src\s*=\s*'([^']+)'/g;
      const matches = html.matchAll(regex);

      const imageUrls = [];
      for (const match of matches) {
        // Construct complete URLs using the base URL
        const baseUrl = 'https://www.sidc.be/solardemon/science/';
        const completeUrl = new URL(match[1], baseUrl);
        imageUrls.push(completeUrl.href);
      }

      if (imageUrls.length > 0) {
        // Display the image URLs (replace this with your own logic)
        console.log('Image URLs:', imageUrls);

        // Use the first image URL for display (replace this with your own logic)
        displayImage(imageUrls[0]);
      } else {
        console.error('No image URLs found in the website content.');
      }
    })
    .catch(error => console.error('Error loading website content:', error));
}



function displayImage(imageUrl) {
  // Construct the absolute URL using the base URL of the website
  const baseURL = new URL(imageUrl).origin;
  const absoluteURL = new URL(imageUrl, baseURL).toString();

  // Find the container element where you want to display the image
  const imageContainer = document.getElementById('imgElement');

  // Check if the container element is found
  if (imageContainer) {


    imgElement.width = 600; // Replace with your preferred width
    imgElement.height = 600; // Replace with your preferred height
  
    // Set the src attribute to trigger the image loading
    imgElement.src = absoluteURL;
  } else {
    console.error('Image container not found.');
  }
}


const csvDataTable = document.getElementById('csvDataTable');
const csvTableHeader = document.getElementById('csvTableHeader');

ipcRenderer.on('image-loaded', (event, data) => {
  updateCsvTable(data.csvRowData);
});

function updateCsvTable(csvRowData) {
  console.log('Updating table with data:', csvRowData);

  const includedProperties = [ 'cmeId', 'cmeDate', 'cmePa', 'cme_width', 'harpnum', 'LONDTMIN', 'LONDTMAX', 'LATDTMIN', 'LATDTMAX', 'flare_id', 'dimming_id', 'verification_score']; // Add properties to include

  const tbody = csvDataTable.querySelector('tbody');
  const row = document.createElement('tr');

  if (Object.keys(csvRowData).length > 0) {
    // Update table headers if not already done
    if (csvTableHeader.children.length === 0) {
      Object.keys(csvRowData).forEach((key) => {
        // Include only specified properties in headers
        if (includedProperties.includes(key)) {
          const th = document.createElement('th');
          th.textContent = key;
          csvTableHeader.appendChild(th);
        }
      });
    }

    Object.keys(csvRowData).forEach((key) => {
      if (includedProperties.includes(key)) {
        const cell = document.createElement('td');
        const cellContent = csvRowData[key] !== undefined ? csvRowData[key].toString() : '';
        cell.innerHTML = cellContent;
        row.appendChild(cell);
      }
    });

    // Clear existing rows and append the new row
    tbody.innerHTML = '';
    tbody.appendChild(row);
  }
}

