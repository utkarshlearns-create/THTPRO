import urllib.request
import json
import urllib.error

url = "https://thtpro.onrender.com/api/users/signup/"
data = {
    "username": "Debug User",
    "phone": "9999999999",
    "password": "password123",
    "role": "PARENT"
}

headers = {
    "Content-Type": "application/json"
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)

print(f"Sending POST to {url}...")

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print("Response:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print("Error Body:", e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
