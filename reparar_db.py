import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url_login = "https://elecciones-cea-backend.onrender.com/login"
data_login = urllib.parse.urlencode({'username': 'admin@cea.com', 'password': '12345'}).encode('utf-8')

print("Haciendo login con admin...")
try:
    req = urllib.request.Request(url_login, data=data_login, method='POST')
    resp = urllib.request.urlopen(req, context=ctx)
    result = json.loads(resp.read().decode())
    token = result.get('access_token')
    print(f"Token obtenido exitosamente.")
    
    url_migracion = "https://elecciones-cea-backend.onrender.com/admin/forzar-migracion"
    req_migracion = urllib.request.Request(url_migracion, method='GET', headers={'Authorization': f"Bearer {token}"})
    print("Ejecutando forzar-migracion...")
    resp_migracion = urllib.request.urlopen(req_migracion, context=ctx)
    print(f"Migracion Completada! Status: {resp_migracion.status}")
    print(resp_migracion.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
