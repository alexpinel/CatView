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




// Your existing code...

let intervalId; // Variable to store the interval ID

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

        // Clear existing interval and display the first image
        resetImageSequence(imageUrls);
      } else {
        console.error('No image URLs found in the website content.');
      }
    })
    .catch(error => console.error('Error loading website content:', error));
}

function resetImageSequence(imageUrls) {
  clearInterval(intervalId); // Clear existing interval

  let currentIndex = 0;

  // Display the first image
  displayImage(imageUrls[currentIndex]);

  // Set interval to change the displayed image
  intervalId = setInterval(() => {
    currentIndex = (currentIndex + 1) % imageUrls.length;
    displayImage(imageUrls[currentIndex]);
  }, 200); // Change the interval time (in milliseconds) as needed
}

function displayImage(imageUrl) {
  // Replace this with your logic to display the image
  console.log('Displaying image:', imageUrl);
  // Your display logic here
}

// Event listeners for the buttons
document.getElementById('previousImage').addEventListener('click', () => {
  clearInterval(intervalId); // Clear existing interval
  // Your logic for going to the previous image here
});

document.getElementById('nextImage').addEventListener('click', () => {
  clearInterval(intervalId); // Clear existing interval
  // Your logic for going to the next image here
});

document.getElementById('goToCustomImage').addEventListener('click', () => {
  clearInterval(intervalId); // Clear existing interval
  // Your logic for going to a custom image based on the input value here
});

// Your existing code...




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

const interact = require('interactjs');

let isImageVisible = false;
let imageContainer;
let draggableContainers = [];

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');
    imageContainer = document.getElementById('imageContainer');

    for (let i = 1; i <= 2; i++) {
        const draggableContainer = document.getElementById(`draggableContainer${i}`);
        draggableContainers.push(draggableContainer);

        interact(draggableContainer)
            .draggable({
                onmove: (event) => dragMoveListener(event, i),
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                onmove: (event) => resizeMoveListener(event, i),
            });
    }

    toggleButton.addEventListener('click', toggleImage);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            toggleImage();
        }
    });
});

function toggleImage() {
    isImageVisible = !isImageVisible;
    imageContainer.classList.toggle('hidden', !isImageVisible);
}

function dragMoveListener(event, index) {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function resizeMoveListener(event, index) {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0);
    const y = (parseFloat(target.getAttribute('data-y')) || 0);

    target.style.width = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}
