import sys
import traceback
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

try:
    response = client.get("/api/cities")
    print("Status Code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except:
        print("Response Text:", response.text)
except Exception as e:
    print("FATAL EXCEPTION DURING REQUEST:")
    traceback.print_exc()
