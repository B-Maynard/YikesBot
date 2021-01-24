from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
import json
import re
from collections import defaultdict
import sys

def main():
    options = webdriver.ChromeOptions()
    options.add_argument('headless')

    # Class names
    boardClassName = 'Board'
    rowClassName = 'Row'

    # We don't have to do an input check here. Should pass/fail inside the javascript

    nameOfGame = sys.argv[1]
    nameOfMap = sys.argv[2]

    try:   
        browser = webdriver.Chrome(ChromeDriverManager().install(), options=options)
        browser.get("https://zombiesworldrecords.com/leaderboards/" + nameOfGame + "/ee-speedrun/" + nameOfMap)

        boards = browser.find_elements_by_class_name(boardClassName)
        boardDictionary = defaultdict(list)

        if boards:
            for board in boards:
                headerText = board.find_elements_by_class_name("Header")[0].text
                rows = board.find_elements_by_class_name(rowClassName)
                tempList = list()
                for row in rows:
                    rowText = row.text
                    rowText = rowText.encode('ascii', 'ignore')
                    rowText = rowText.decode("utf-8")
                    rowText = rowText.replace('\n', ' ')
                    tempList.append(rowText)

                boardDictionary[headerText].append(tempList)
        else:
            print("Could not find data with given parameters: " + nameOfGame + ", " + nameOfMap)
            browser.quit()
            return
                
                        
        jsonObject = json.dumps(boardDictionary)
        browser.quit()
        print(jsonObject)
    except Exception as e:
        browser.quit()
        print(e)

if __name__ == "__main__":
    main()