import urllib.request
import urllib.parse
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://elecciones-cea-backend.onrender.com/login"
data = urllib.parse.urlencode({'username': 'admin@cea.com', 'password': 'password123'}).encode('utf-8')

try:
    req = urllib.request.Request(url, data=data, method='POST')
    resp = urllib.request.urlopen(req, context=ctx)
    print(f"Status: {resp.status}")
    print(resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
