# Google Sheet Form Setup

1. Open the Google Sheet where you want to store form submissions.
2. Go to `Extensions` -> `Apps Script`.
3. Paste the code from `Code.gs` into the script editor and save.
4. Click `Deploy` -> `New deployment`.
5. Select type: `Web app`.
6. Execute as: `Me`.
7. Who has access: `Anyone`.
8. Deploy and copy the Web App URL.
9. Open `contact.html` and set the form attribute:

```html
<form id="contact-form" class="space-y-8" data-google-script-url="PASTE_WEB_APP_URL_HERE">
```

10. Save and test the form. New responses will be appended to the `FormResponses` sheet tab.

