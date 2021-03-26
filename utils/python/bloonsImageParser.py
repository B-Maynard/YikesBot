from cv2 import cv2
import pytesseract
import numpy as np
import requests
import sys
from PIL import Image, ImageFilter
import re
import os

# Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

def main():
    # NOTE: This should always be a valid url from discord. we'll do error checking inside javascript when the message is called.
    picture_url = sys.argv[1]


    img_data = requests.get(picture_url).content
    with open('temp.png', 'wb') as handler:
        handler.write(img_data)


    # Open the image with PIL and do some conversion
    img = Image.open('temp.png').convert('RGB')
    na = np.array(img)
    orig = na.copy()


    img = img.filter(ImageFilter.MedianFilter(3))

    try:

        # Find all areas in the image that match the background of the 'Round' dialog box
        blueY, blueX = np.where(np.all(na==[60, 96, 146], axis=2))

        top, bottom  = blueY[0], blueY[-1]
        left, right = blueX[0], blueX[-1]

        # Crop the image to only see the spots that have that background from above
        ROI = orig[top:bottom, left:right]

        gray = cv2.cvtColor(ROI, cv2.COLOR_BGR2GRAY)
        gray = cv2.bilateralFilter(gray, 11, 17, 17)

        (thresh, blackAndWhiteImage) = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        
        # Used for seeing the images it's creating up above

        # cv2.imshow('Black white image', blackAndWhiteImage)
        # cv2.imshow('gray', gray)

        # cv2.waitKey(0)
        # cv2.destroyAllWindows()


        text = pytesseract.image_to_string(blackAndWhiteImage)
        result = re.findall(r"round [0-9]*", text, re.IGNORECASE)
        if result:
            text = result[0]
            print(text)
            os.remove('temp.png')

        return

    except Exception as e:
        print("There was an error parsing the round count.")
        return



if __name__ == "__main__":
    main()