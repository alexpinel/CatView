import csv
from datetime import datetime
import requests
from PIL import Image
import io
import os
import matplotlib.pyplot as plt

# Function to convert date format
def convert_date_format(original_date):
    # Convert the date to the desired format
    new_date = datetime.strptime(original_date, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    return new_date

# Function to open URL and display image using Matplotlib
def open_url_and_display_image_matplotlib(url):
    response = requests.get(url)
    image = Image.open(io.BytesIO(response.content))

    # Display the image using Matplotlib
    plt.imshow(image)
    plt.show()

# CSV file path
csv_file_path = 'alex_database.csv'  # Replace with your actual CSV file path

# List to store CME dates
cme_dates = []

# Read CSV file
with open(csv_file_path, 'r') as csvfile:
    reader = csv.DictReader(csvfile)
    
    # Assuming 'cme_date' is the column header for the date values
    for row in reader:
        cme_date = row['cme_date']
        converted_date = convert_date_format(cme_date)
        cme_dates.append(converted_date)

# Now, you can create the URLs using the converted dates
base_url = "https://helioviewer-api.ias.u-psud.fr//v2/takeScreenshot/?imageScale=2&layers=[SDO,AIA,AIA,335,1,100]&events=&eventLabels=true&scale=true&scaleType=earth&scaleX=0&scaleY=0&x1=-1000&x2=1000&y1=-1000&y2=1000&display=true&watermark=true&events=[CH,all,1]"

# Loop through the URLs, download the image, display it with Matplotlib, and delete it
for converted_date in cme_dates:
    url = f"{base_url}&date={converted_date}"
    print(f"Opening URL: {url}")

    # Download the image
    response = requests.get(url)
    image_path = os.path.join(os.getcwd(), "temp_image.png")
    with open(image_path, "wb") as f:
        f.write(response.content)

    # Display the image using Matplotlib
    open_url_and_display_image_matplotlib(url)
    
    # Delete the image file immediately after displaying
    os.remove(image_path)

    # Ask the user to press enter to move to the next URL
    input("Press Enter to open the next URL...")