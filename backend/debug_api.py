import requests

response = requests.post("http://127.0.0.1:8000/api/assets/1/preventive", json={"description": "teste debug"})
print(response.status_code)
print(response.text)
