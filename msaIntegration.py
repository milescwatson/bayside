import requests
USERNAME = ''
PASSWORD = ''

def getSession():

    pass


url = "https://us.msasafety.com/my-account/orders?searchByNumber=false&searchByDate=last-six-months&inProcessOnly=false&sortVal=orderDate&asc=false"
payload={}

headers = {
  'authority': 'us.msasafety.com',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'accept-language': 'en-US,en;q=0.9',
  'cache-control': 'no-cache',
  'cookie': 'regionIso=US; msaSwitchRegion=us_en; ps-location=37.97353%7C-122.53109%7CUS%7C94901%7CSan%20Rafael%7CCA%7CSan%20Rafael%2C%20CA%7C0.0925; OptanonAlertBoxClosed=2022-09-15T23:09:11.074Z; username=; JSESSIONID=DB541201047119B799CBFC8143EA7989.worker2; SECSESSIONID=1cdb595895ac60c8848918e35165d685448ce7a2; lagrange_session=5f8ccac6-2b2a-4700-b5a5-a7f71c740193; acceleratorSecureGUID=e1da2f5e06b0860af4d5367165a6b7e6117ccefc; OptanonConsent=isGpcEnabled=0&datestamp=Thu+Sep+15+2022+17%3A59%3A44+GMT-0700+(Pacific+Daylight+Time)&version=6.23.0&isIABGlobal=false&hosts=&consentId=97019dad-5517-4cdb-af4c-6471c82fe1e6&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0003%3A1%2CC0002%3A1%2CC0004%3A1&geolocation=US%3BCA&AwaitingReconsent=false; lagrange_session=5f8ccac6-2b2a-4700-b5a5-a7f71c740193',
  'pragma': 'no-cache',
  'referer': 'https://us.msasafety.com/my-account/orders',
  'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
}

response = requests.request("GET", url, headers=headers, data=payload)


print(response.text)
print('status code = ' + str(response.status_code))
