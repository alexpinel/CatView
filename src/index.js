const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const moment = require('moment');

let mainWindow;
let imageUrls = [];
let currentImageIndex = 0;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      allowFileAccess: true, // Allow access to local files
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));


  loadAndProcessCSV();
};


let videoUrls = [];
let dimmingDetailsUrls = [];
let currentRowIndex = 0;
let csvData = [];

const convertDatePicFormat = (originalDate) => {
  const formattedDate = moment(originalDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  return formattedDate;
};

const convertDateVidFormat = (originalDate) => {
  const formattedVidDate = moment(originalDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY');
  return formattedVidDate;
};

const loadAndProcessCSV = async () => {
  const csvFilePath = path.join(__dirname, '../alex_database.csv');
  const data = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      const cmeId = row.cme_id; // Add other properties as needed
      const cmeDate = row.cme_date;
      const cmePa = row.cme_pa;
      const cme_width = row.cme_width; // Add other properties as needed
      const harpnum = row.harpnum;
      const LONDTMIN = row.LONDTMIN;
      const LONDTMAX = row.LONDTMAX; // Add other properties as needed
      const LATDTMIN = row.LATDTMIN;
      const LATDTMAX = row.LATDTMAX;
      const flare_id = row.flare_id; // Add other properties as needed
      const dimming_id = row.dimming_id;
      const verification_score = row.verification_score;

      const formattedDate = convertDatePicFormat(cmeDate);
      const formattedVidDate = convertDateVidFormat(cmeDate);
      const videoFileName = `${formattedVidDate}.01.01.mov`;
    
      // Assume the videos are stored in the same directory as the CSV file
      const videoFilePath = path.join(__dirname, '..', 'SHARPS', videoFileName);
    
      const apiUrl = `https://helioviewer-api.ias.u-psud.fr/v2/takeScreenshot/?imageScale=2.4204409&layers=[SDO,AIA,AIA,335,1,100]&events=&eventLabels=true&scale=true&scaleType=earth&scaleX=0&scaleY=0&date=${formattedDate}&x1=-1000&x2=1000&y1=-1000&y2=1000&display=true&watermark=true&events=[CH,all,1]`;
    
      // Add dimming_id and generate dimming details URL
      const dimmingId = parseFloat(row.dimming_id).toString(); // Remove trailing zeros
      const dimmingDetailsUrl = `https://www.sidc.be/solardemon/science/dimmings_details.php?science=1&dimming_id=${dimmingId}&delay=80&prefix=dimming_mask_&small=1&aid=0&graph=1`;
    
      data.push({ cmeId, cmeDate, cmePa, cme_width, harpnum, LONDTMIN, LONDTMAX, LATDTMIN, LATDTMAX, flare_id, dimming_id, verification_score,  videoFilePath, apiUrl, dimmingDetailsUrl });
    })
    .on('end', () => {
      csvData = data;
      imageUrls = data.map((item) => item.apiUrl);
      videoUrls = data.map((item) => item.videoFilePath);
      dimmingDetailsUrls = data.map((item) => item.dimmingDetailsUrl);
    });
  
    ipcMain.on('load-next-image', loadNextImage);
    ipcMain.on('load-previous-image', loadPreviousImage);
    ipcMain.on('load-custom-image', loadCustomImage);

    loadNextImage();

};

const loadNextImage = () => {
  if (currentImageIndex < imageUrls.length) {
    loadAndSendImage(currentImageIndex);
    currentImageIndex++;
  } else {
    // All images loaded, do something or reset for the next iteration
    currentImageIndex = 0;
  }
};

const loadPreviousImage = () => {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    loadAndSendImage(currentImageIndex);
  } else {
    // Handle when trying to go beyond the first image
  }
};

const loadCustomImage = (event, customIndex) => {
  if (customIndex >= 0 && customIndex < imageUrls.length) {
    currentImageIndex = customIndex;
    loadAndSendImage(currentImageIndex);
  } else {
    // Handle invalid custom index
  }
};

const loadAndSendImage = (index) => {
  const imageUrl = imageUrls[index];
  const videoUrl = videoUrls[index];
  const dimmingDetailsUrl = dimmingDetailsUrls[index];
  const csvRowData = csvData[index];

  mainWindow.webContents.send('image-loaded', { imageUrl, videoUrl, dimmingDetailsUrl, csvRowData });
};


// ... (unchanged code)


app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



