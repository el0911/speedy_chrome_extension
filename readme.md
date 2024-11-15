Speedy a chrome extension to help you quickly save files to your google drive,

https://www.loom.com/share/ee0fa20e9f1147678fe605ed5a1b20c3?sid=84701251-3a19-45e5-a724-4ff06f83f43f


open the `manifest.json`

```json
{
  "manifest_version": 3,
  "name": "Screenshot to Google Drive",
  "version": "1.0",
  "permissions": ["identity", "activeTab", "scripting", "storage", "clipboardWrite"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  },
  "background": {
    "service_worker": "background.js"
  },
  "oauth2": {
    "client_id": "PUT YOUE OWN oauth client id",
    "scopes": ["https://www.googleapis.com/auth/drive.file"]
  }
}
```

Replace the client Id with your own client ID takes about 20 minutes to setup, make sure you enable google oauth and google drive APIS