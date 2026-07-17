import urllib.request

url = "https://main.d3mu8a9cvbjgf8.amplifyapp.com"
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as response:
        print("STATUS:", response.status)
        print("BODY HEAD:", response.read(200).decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print("BODY HEAD:", e.read(200).decode('utf-8'))
except Exception as e:
    print("ERROR:", str(e))
