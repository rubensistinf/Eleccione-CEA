import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url_login = "https://elecciones-cea-backend.onrender.com/login"
data_login = urllib.parse.urlencode({'username': 'admin@cea.com', 'password': '12345'}).encode('utf-8')

try:
    req = urllib.request.Request(url_login, data=data_login, method='POST')
    resp = urllib.request.urlopen(req, context=ctx)
    result = json.loads(resp.read().decode())
    token = result.get('access_token')
    
    url_candidatos = "https://elecciones-cea-backend.onrender.com/secretaria/candidatos"
    req_cands = urllib.request.Request(url_candidatos, method='GET', headers={'Authorization': f"Bearer {token}"})
    resp_cands = urllib.request.urlopen(req_cands, context=ctx)
    print(f"Status Candidates GET: {resp_cands.status}")
    print(resp_cands.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
