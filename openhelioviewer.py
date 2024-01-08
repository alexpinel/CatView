import csv
from datetime import datetime
import webbrowser
import os
import requests
import cv2
import matplotlib.pyplot as plt
from matplotlib.image import imread
import numpy as np
import io

# Function to convert date format for URL
def convert_date_format_url(original_date):
    # Convert the date to the desired format
    new_date = datetime.strptime(original_date, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%S.000Z")
    return new_date

# Function to convert date format for video filename
def convert_date_format_video(original_date):
    # Convert the date to the desired format with day set to "01"
    new_date = datetime.strptime(original_date, "%Y-%m-%d %H:%M:%S").replace(month=1, day=1).strftime("%Y.%m.%d")
    return new_date

# Function to open video file using OpenCV
def open_video_for_date(date_str):
    # Convert the date string to a datetime object
    date = datetime.strptime(date_str, "%Y.%m.%d")

    # List of potential date formats used in video filenames
    date_formats = ["%Y.%m.%d", "%Y-%m-%d", "%Y%m%d"]

    # Replace with the actual path to your videos
    base_video_path = "./SHARPS/harp.hmi.Marmask_720s_{}_TAI_{}d@2h_mask.mp4"

    # Try different date formats
    for format in date_formats:
        formatted_date = date.strftime(format)

        # Construct the video file path
        video_file_path = base_video_path.format(formatted_date, 365)  # Example: 365d@2h
        print(f"Trying video file: {video_file_path}")

        # Attempt to open the video
        cap = cv2.VideoCapture(video_file_path)
        if cap.isOpened():
            print(f"Opening video: {video_file_path}")
            frames = []

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                # Collect video frames
                frames.append(frame)

            cap.release()
            return frames, formatted_date

    print(f"Video file not found for date: {formatted_date}")
    return None, None

# Function to open image using Matplotlib
def open_image_url(url):
    response = requests.get(url)
    img = imread(io.BytesIO(response.content), format='png')
    return img

# CSV file path
csv_file_path = 'alex_database.csv'  # Replace with your actual CSV file path

# Read CSV file
with open(csv_file_path, 'r') as csvfile:
    reader = csv.DictReader(csvfile)
    
    # Assuming 'cme_date' is the column header for the date values
    for row in reader:
        cme_date = row['cme_date']
        converted_date_for_url = convert_date_format_url(cme_date)
        converted_date_for_video = convert_date_format_video(cme_date)

        # Create the URL with the correct date format
        base_url = "https://helioviewer-api.ias.u-psud.fr//v2/takeScreenshot/?imageScale=2&layers=[SDO,AIA,AIA,335,1,100]&events=[AR,HMI_HARP;SPoCA,1],[CH,all,1]&eventLabels=true&scale=true&scaleType=earth&scaleX=0&scaleY=0&x1=-1000&x2=1000&y1=-1000&y2=1000&display=true&watermark=true&events=[CH,all,1]"
        url = f"{base_url}&date={converted_date_for_url}"

        print(f"Opening URL: {url}")

        # Open the image using Matplotlib
        img = open_image_url(url)

        # Open the corresponding video for the date
        frames, formatted_date = open_video_for_date(converted_date_for_video)

        if img is not None and frames is not None:
            # Display image and video side by side
            fig, axs = plt.subplots(1, 2, figsize=(12, 6))
            axs[0].imshow(img)
            axs[0].axis('off')

            for frame in frames:
                axs[1].imshow(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                axs[1].axis('off')
                plt.pause(0.1)

            plt.suptitle(f'Date: {formatted_date}')
            plt.show()

        # Ask the user to press enter to move to the next URL
        input("Press Enter to open the next URL...")
