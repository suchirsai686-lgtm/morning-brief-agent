import urllib.request
import json

url = "https://tjc587zok8.execute-api.us-east-1.amazonaws.com/prod/profile/test%40example.com"
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as response:
        print("STATUS:", response.status)
        print("BODY:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print("BODY:", e.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", str(e))
