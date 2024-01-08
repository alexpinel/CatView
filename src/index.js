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

  mainWindow.webContents.openDevTools();

  loadAndProcessCSV();
};


let videoUrls = [];

const loadAndProcessCSV = async () => {
  const csvFilePath = path.join(__dirname, '../alex_database.csv');
  const data = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      const cmeDate = row.cme_date;
      const formattedDate = convertDatePicFormat(cmeDate);
      const formattedVidDate = convertDateVidFormat(cmeDate);
      const videoFileName = `${formattedVidDate}.01.01.mov`;

      // Assume the videos are stored in the same directory as the CSV file
      const videoFilePath = path.join(__dirname, '..', 'SHARPS', videoFileName);

      const apiUrl = `https://helioviewer-api.ias.u-psud.fr/v2/takeScreenshot/?imageScale=2.4204409&layers=[SDO,AIA,AIA,335,1,100]&events=&eventLabels=true&scale=true&scaleType=earth&scaleX=0&scaleY=0&date=${formattedDate}&x1=-1000&x2=1000&y1=-1000&y2=1000&display=true&watermark=true&events=[CH,all,1]`;

      // Add dimming_id and generate dimming details URL
      const dimmingId = row.dimming_id.replace('.', ''); // Remove decimals
      const dimmingDetailsUrl = `https://www.sidc.be/solardemon/science/dimmings_details.php?science=1&dimming_id=${dimmingId}&delay=80&prefix=dimming_mask_&small=1&aid=0&graph=1`;

      data.push({ apiUrl, videoFilePath, dimmingDetailsUrl });
    })
    .on('end', () => {
      imageUrls = data.map((item) => item.apiUrl);
      videoUrls = data.map((item) => item.videoFilePath);
      dimmingDetailsUrls = data.map((item) => item.dimmingDetailsUrl);
      
      ipcMain.on('load-next-image', loadNextImage);
      loadNextImage();
    });
};


const convertDatePicFormat = (originalDate) => {
  const formattedDate = moment(originalDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  return formattedDate;
};

const convertDateVidFormat = (originalDate) => {
  const formattedVidDate = moment(originalDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY');
  return formattedVidDate;
};

const loadNextImage = () => {
  if (currentImageIndex < imageUrls.length) {
    const imageUrl = imageUrls[currentImageIndex];
    const videoUrl = videoUrls[currentImageIndex];
    const dimmingDetailsUrl = dimmingDetailsUrls[currentImageIndex];
    mainWindow.webContents.send('image-loaded', { imageUrl, videoUrl, dimmingDetailsUrl });
    currentImageIndex++;
  } else {
    // All images loaded, do something or reset for the next iteration
    currentImageIndex = 0;
  }
};

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



