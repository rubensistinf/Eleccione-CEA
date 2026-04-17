import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://elecciones-cea-backend.onrender.com/openapi.json"
try:
    req = urllib.request.Request(url, method="GET")
    resp = urllib.request.urlopen(req, context=ctx)
    data = json.loads(resp.read())
    
    for path, methods in data.get("paths", {}).items():
        if "delete" in methods:
            print(f"DELETE {path}")
except Exception as e:
    pass
