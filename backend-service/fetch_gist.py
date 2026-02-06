import requests
import json
import os

# Configuration
GIST_ID = "364c7cc98dacc6fa7d1f59dd7862e856"
GIST_FILENAME = "source_config.json"
GIST_API_URL = f"https://api.github.com/gists/{GIST_ID}"
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
LOCAL_FILE_PATH = os.path.join(THIS_FOLDER, 'source_config.json')

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

headers = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json"
}

def fetch_gist_json(timeout=5):
    response = requests.get(GIST_API_URL, timeout=timeout, headers=headers)
    response.raise_for_status()
    gist_info = response.json()
    file_info = gist_info["files"][GIST_FILENAME]
    raw_url = file_info["raw_url"]

    raw_response = requests.get(raw_url, timeout=timeout, headers=headers)
    raw_response.raise_for_status()
    return raw_response.json()

def fetch_and_save_gist():
    try:
        gist_data = fetch_gist_json()
        with open(LOCAL_FILE_PATH, 'w') as file:
            json.dump(gist_data, file, indent=4)
        print("Gist data fetched and saved successfully.")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Gist: {e}")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    
if __name__ == "__main__":
    fetch_and_save_gist()
