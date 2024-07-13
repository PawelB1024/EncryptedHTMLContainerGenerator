## Introduction
Project done as part of my thesis.

The application runs on a Node.js server and allows for generating .html files with encrypted content. To open and decrypt such a file, no additional software is needed. The application was written in pure JavaScript.

## Features
- Generetes files with custom HTML element.
- Encryption and decryption using Web Crypto API, key derivation function is PBKDF2 and encryption algorithm is AES256-GCM.
- Secure password generator.
- Code obfuscation using Obfuscator.io.
- Semi-blocked devtools.
- Content observer to prevent live code manipulation.
- Time lockout when the password is entered incorrectly three times in a row, even after refreshing the page.
- Direct file upload to Google Drive (requires configuring a Google service account and placing the .json key).
- Optional zip with current year password.

## Notes
UI is in Polish. \
Credits to my thesis supervisor dr. hab. Jerzy Goraus. 

## Previews
### Generator
![preview_generator](https://github.com/user-attachments/assets/36fa87fb-bd72-4747-a198-5b0fa5b6a1c6)
### Container
![preview_container](https://github.com/user-attachments/assets/23030368-20fc-40c1-831c-9f0346f8992d)
