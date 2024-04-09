const express = require('express');
const path = require('path');
const fs = require('fs');
const JSZip = require('jszip');
const { exec } = require('child_process');
const app = express();
app.use(express.json());
const port = 3000;
const { google } = require('googleapis');
const drive = google.drive('v3');
const { GoogleAuth } = require('google-auth-library');
const auth = new GoogleAuth({
    keyFile: 'encrypted-containers-html-adba6a5e50fe.json',
    scopes: ['https://www.googleapis.com/auth/drive']
});
var JavaScriptObfuscator = require('javascript-obfuscator');


app.use(express.static('public'));
app.use(express.text({ type: 'text/plain' }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.post('/process', async (req, res) => {
    async function uploadToGoogleDrive(filePath, fileName, mimeType) {
        const authClient = await auth.getClient();
        google.options({ auth: authClient });
    
        const fileMetadata = {
            name: fileName,
            parents: ['1UAR5162fD-hA4B9MMA6cvUC7hwBiHAGD']
        };
        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath)
        };
    
        try {
            const file = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id'
            });
    
            const fileId = file.data.id;
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });
    
            const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
            return fileUrl;
    
        } catch (error) {
            console.error('Błąd przesyłania do Google Drive:', error.message);
            throw new Error('Błąd przesyłania do Google Drive');
        } finally {
            fs.unlinkSync(filePath); 
        }
    }
    function executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }
    function generateRandomNumbers(length) {
        const charset = '0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            let randomIndex = Math.floor(Math.random() * charset.length);
            result += charset[randomIndex];
        }
        return result;
    }
    function sendZipFile(zipPath) {
        res.download(zipPath, `${fileName}.zip`, (err) => {
            if (err) throw err;
            fs.unlinkSync(filePath);
            fs.unlinkSync(zipPath);
        });
    }
    function getShortPath(longPath) {
        return new Promise((resolve, reject) => {
            exec(`for %I in ("${longPath}") do @echo %~sI`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }
    
    async function createZipWithJSZip(zipPath, processedHtml, fileName) {
        const zip = new JSZip();
        zip.file(`${fileName}.html`, processedHtml);
        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(zipPath, zipContent);  
    }
    function encryptCaesar(str, shift) {
        let encrypted = '';
        for (let i = 0; i < str.length; i++) {
            let charCode = str.charCodeAt(i) + shift;
            encrypted += charCode + '-';
        }
        return encrypted.slice(0, -1);
    }
    function permuteStringWithKey(input, value) {
        let result = '';
        for (let i = 0; i < input.length; i++) {
          const charCode = input.charCodeAt(i) ^ value
          result += String.fromCharCode(charCode);
        }
        return result;
      }
      
    

    const fileName = "encryptedMessage" + generateRandomNumbers(Math.floor(Math.random() * (8 - 6 + 1)) + 6);
    const { encryptedDataString, salt, iv } = req.body
    const htmlContent = generatePage(encryptedDataString, salt, iv);
    const zipChecked = req.headers['zip-checked'] === 'true';
    const gdriveChecked = req.headers['gdrive-checked'] === 'true';

    const scriptTagStart = htmlContent.indexOf('<script>') + 9;
    const scriptTagEnd = htmlContent.indexOf('</script>');

    const partBeforeScript = htmlContent.substring(0, scriptTagStart);
    const partAfterScript = htmlContent.substring(scriptTagEnd);

    let scriptContent = htmlContent.substring(scriptTagStart, scriptTagEnd);

    scriptContent = JavaScriptObfuscator.obfuscate(scriptContent,
        {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.1,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 1,
            debugProtection: true,
            debugProtectionInterval: 1005,
            disableConsoleOutput: false,
            domainLock: [],
            domainLockRedirectUrl: 'about:blank',
            identifierNamesGenerator: 'hexadecimal',
            ignoreImports: true,
            log: false,
            numbersToExpressions: true,
            renameGlobals: true,
            renameProperties: true,
            renamePropertiesMode: 'unsafe',
            reservedNames: [
                'connectedCallback',
                'disconnectedCallback',
                'salt',
                'iv',
                'iterations'
            ],
            seed: parseInt(generateRandomNumbers(3)),
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 5,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayCallsTransformThreshold: 0.5,
            stringArrayEncoding: ['rc4'],
            stringArrayIndexesType: [
                'hexadecimal-number'
            ],
            optionsPreset: 'high-obfuscation',
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 5,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 5,
            stringArrayWrappersType: 'function',
            stringArrayThreshold: 1,
            target: 'browser',
            transformObjectKeys: true,
            unicodeEscapeSequence: false
        })._obfuscatedCode;
    scriptContent = encryptCaesar(scriptContent, 7);
    scriptContent = permuteStringWithKey(scriptContent, 7);
    scriptContent = `
    function unpack(encryptedStr, key) {
        let permuted = '';
        for (let i = 0; i < encryptedStr.length; i++) {
            const charCode = encryptedStr.charCodeAt(i) ^ key;
            permuted += String.fromCharCode(charCode);
        }
    
        let decrypted = '';
        let charCodes = permuted.split('-');
        for (let code of charCodes) {
            let charCode = parseInt(code, 10) - key;
            decrypted += String.fromCharCode(charCode);
        }
    
        return decrypted;
    }
    eval(unpack(
    `
    +`"${scriptContent}"`
    +", 7));";

    const processedHtml = partBeforeScript + scriptContent + partAfterScript;

    const filePath = path.join(__dirname, `${fileName}.html`);
    fs.writeFileSync(filePath, processedHtml);
    res.set('Content-Disposition', `attachment; filename="${fileName}"`);

    if (zipChecked) {
        const currentYear = new Date().getFullYear();
        const zipPath = path.join(__dirname, `${fileName}.zip`);
        const shortFilePath = await getShortPath(filePath);
        const shortZipPath = await getShortPath(zipPath);
        const command7z = `7z a -p${currentYear} ${shortZipPath} ${shortFilePath}`;
        const commandZip = `zip -P ${currentYear} ${zipPath} ${filePath}`;
        const command7zFullpath = `"C:\\Program Files\\7-Zip\\7z.exe" a -p${currentYear} ${shortZipPath} ${shortFilePath}`;
    
        try {
            await executeCommand(command7z);
        } catch (error) {
            console.error('7z failed, trying again', error.message);
            try {
                await executeCommand(command7zFullpath);
            } catch (secondError) {
                console.error('7z failed, trying zip in the next step', secondError.message);
                try {
                    await executeCommand(commandZip);
                } catch (thirdError) {
                    console.error('zip failed, creating zip with JSZip', thirdError.message);
                    await createZipWithJSZip(zipPath, processedHtml, fileName);
                }
            }
        }
        if(gdriveChecked) {
            try {
                const fileUrl = await uploadToGoogleDrive(zipPath, fileName, 'application/zip');
                fs.unlinkSync(filePath);
                res.send({ url: fileUrl });
            } catch (error) {
                res.status(500).send(error.message);
            }
        }
        else{
            sendZipFile(zipPath);
        }
        
    }
    else {
        if(gdriveChecked) {
            try {
                const fileUrl = await uploadToGoogleDrive(filePath, fileName, 'text/html');
                res.send({ url: fileUrl });
            } catch (error) {
                res.status(500).send(error.message);
            }
        }
        else{
            res.sendFile(filePath, () => {
                fs.unlinkSync(filePath);
            });
        }

    }
});

app.listen(port, () => {
    console.log(`Serwer uruchomiony na http://localhost:${port}`);
});

function generatePage(encryptedDataString, salt, iv) {
    /* Funkcje blokujące devtools inspirowane https://github.com/DungGramer/disable-devtool/blob/master/src/index.ts
    Jednak są napisane w javascripcie a nie typescripcie oraz dodatkowo zabezpieczone */
    function generateRandomString(length) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            let randomIndex = Math.floor(Math.random() * charset.length);
            result += charset[randomIndex];
        }
        return result;
    }    
    function generateUniqueRandomString(length) {
        let randomString;
        do {
          randomString = generateRandomString(length);
        } while (isValueAlreadyUsed(randomString));
      
        usedValues.push(randomString); 
        return randomString;
      }
    function isValueAlreadyUsed(value) {
        return usedValues.includes(value);
    }
    let usedValues = [];

    let keys = [
        "attemptsName",
        "lastAttemptTimeName",
    ];
    
    let names = {};
    for (let key of keys) {
        names[key] = generateUniqueRandomString(Math.floor(Math.random() * (8 - 6 + 1)) + 6);   
    }
    

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Encrypted Message</title>
    <style>
    * {
    font-family: 'Arial';
    }
    body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f2f2f2;
    }

    encrypted-container {
        width: 500px;
        height: 300px;
        text-align: center;
        background-color: #ffffff;
        padding: 20px;
        border: 2px solid #ccc;
        border-radius: 10px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    }
    #container-info {
        width: 500px; 
        height: 125px;
        text-align: center;
		margin-bottom: 10px;
        background-color: #ffffff;
        padding: 20px;
        padding-top: 0px;
        border: 2px solid #ccc;
        border-radius: 10px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    }

    input, button, textarea {
        margin: 5px;
        padding: 10px;
    }
    textarea {
		height: 70%;
        width: 90%;
        resize: none;
        border: 2px solid #ccc;
        border-radius: 5px;
    }
    </style>
</head>
<body>
    <div id="container-info">
        <p>Poniżej znajduje się kontener z zaszyfrowaną wiadomością.</p>
        <p>Nie otwieraj pliku z załącznika, pobierz i otwórz plik.</p>
        <p>Ingerencja w kod strony może nieodwracalnie uszkodzić kontener!</p>
        <p>Wprowadź hasło by odszyfrować wiadomość.</p>
    </div>
    <script>
    class EncryptedContainer extends HTMLElement {
        constructor(dataStr, dataSalt, dataIv, attempts = null, lastAttemptTime = null) {
            super();
            this.dataStr = dataStr;
            this.dataSalt = dataSalt;
            this.dataIv = dataIv;
			if(!attempts && !lastAttemptTime)
			{
				this.attempts = EncryptedContainer.generateRandomString(10);
				let lastAttemptTime;
				do {
					lastAttemptTime = EncryptedContainer.generateRandomString(10);
				} while (lastAttemptTime === this.attempts);
				this.lastAttemptTime = lastAttemptTime;
			}
			else if(!attempts){
				this.attempts = attempts;
				this.lastAttemptTime = EncryptedContainer.generateRandomString(10);
			}
			else if(!lastAttemptTime)
			{
				this.attempts = EncryptedContainer.generateRandomString(10);
				this.lastAttemptTime = lastAttemptTime;
			}
			else{
				this.attempts = attempts;
				this.lastAttemptTime = lastAttemptTime;
			}
            this.attemptsCheck = 0;
            this.lastAttemptTimeCheck = 0;
            this.initializeLockoutState();
		}
        connectedCallback() {
            this.passwordInput = document.createElement('input');
            this.passwordInput.type = 'text';
            this.passwordInput.placeholder = 'Wprowadź hasło';
            
            this.decryptButton = document.createElement('button');
            this.decryptButton.textContent = 'Rozszyfruj';
            this.decryptButton.addEventListener('click', () => this.decryptMessage());
        
            this.textArea = document.createElement('textarea');
            this.textArea.readOnly = true;
            this.textArea.placeholder = 'Tu będzie widoczna rozszyfrowana wiadomość...'
            
            this.appendChild(this.passwordInput);
            this.appendChild(this.decryptButton);
            this.appendChild(document.createElement('br'));
            this.appendChild(this.textArea);

            this.observer = new MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName !== 'value') {
                        this.remove();
                        this.observer.disconnect();
                        break;
                    }
                    if (mutation.type === 'childList') {
                        this.remove();
                        this.observer.disconnect();
                        break;
                    }
                }
            });

            this.observer.observe(this, {
                attributes: true, 
                childList: true, 
                subtree: true
            });
        }
        disconnectedCallback() {
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
        }
        initializeLockoutState() {
            if (localStorage.getItem(this.attempts) === null) {
                localStorage.setItem(this.attempts, '0');
            }
            if (localStorage.getItem(this.lastAttemptTime) === null) {
                localStorage.setItem(this.lastAttemptTime, '0');
            }
        }
        static generateRandomString(length) {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let result = '';
            for (let i = 0; i < length; i++) {
                let randomIndex = Math.floor(Math.random() * charset.length);
                result += charset[randomIndex];
            }
            return result;
        }
        getLockoutTime(attempts) {
            if (attempts === 3) return 30 * 1000;
            else if (attempts === 4) return 2 * 60 * 1000;
            else if (attempts > 4) return 10 * 60 * 1000;
    
            return 0;
        }
        checkLockout() {
            const attempts = parseInt(localStorage.getItem(this.attempts) || '0');
            const lastAttemptTime = parseInt(localStorage.getItem(this.lastAttemptTime) || '0');
            const currentTime = new Date().getTime();
            const lockoutTime = this.getLockoutTime(attempts);
            if (currentTime - lastAttemptTime < lockoutTime) {
                const remainingLockoutTime = lockoutTime - (currentTime - lastAttemptTime);
                const remainingSeconds = Math.ceil(remainingLockoutTime / 1000);
                let remainingTimeStr;
    
                if (remainingSeconds < 60) {
                    remainingTimeStr = remainingSeconds + " sekund";
                } else {
                    const minutes = Math.floor(remainingSeconds / 60);
                    const seconds = remainingSeconds % 60;
                    remainingTimeStr = minutes + " minut " + seconds + " sekund";
                }
    
                alert("Zbyt wiele prób. Spróbuj ponownie za: " + remainingTimeStr);
                return false;
            }
    
        return true;
        }
        recordFailedAttempt() {
            const storedAttempts = parseInt(localStorage.getItem(this.attempts) || '0');
            const storedLastAttemptTime = parseInt(localStorage.getItem(this.lastAttemptTime) || '0');
            
            const attempts = storedAttempts + 1;
            const currentTime = new Date().getTime();
        
            localStorage.setItem(this.attempts, attempts.toString());
            localStorage.setItem(this.lastAttemptTime, currentTime.toString());
        
            this.attemptsCheck = attempts.toString();
            this.lastAttemptTimeCheck = currentTime.toString();
        
            alert("Błąd deszyfrowania");
        }
        async decryptMessage() {
            if (!this.checkLockout()) {
                return;
            }
            if(!localStorage.getItem(this.attempts) || !localStorage.getItem(this.lastAttemptTime))
            {
                return;
            }
            const storedAttempts = parseInt(localStorage.getItem(this.attempts));
            const storedLastAttemptTime = parseInt(localStorage.getItem(this.lastAttemptTime));
            if ((parseInt(this.attemptsCheck) > storedAttempts) || (parseInt(this.lastAttemptTimeCheck) > storedLastAttemptTime)) {
                return;
            }
            EncryptedContainer.showOverlay();
            const password = this.passwordInput.value;
            const encryptedData = EncryptedContainer.base64ToArrayBuffer(this.dataStr);
            const dataSalt = localStorage.getItem(this.attempts) !== null ? EncryptedContainer.base64ToArrayBuffer(this.dataSalt) : null;
            const dataIv = localStorage.getItem(this.lastAttemptTime) !== null ? EncryptedContainer.base64ToArrayBuffer(this.dataIv) : null 
    
            try {
                const decryptedData = await this.decryptText(encryptedData, password, dataSalt, dataIv);
                this.textArea.value = decryptedData;
            } catch (e) {
                this.recordFailedAttempt();
            } finally {
                EncryptedContainer.hideOverlay();
            }
        }
        async decryptText(encryptedData, password, dataSalt, dataIv) {
            const encoder = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                "raw",
                encoder.encode(password),
                {name: "PBKDF2"},
                false,
                ["deriveKey"]
            );
    
            const key = await window.crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: dataSalt,
                    iterations: 1000000,
                    hash: "SHA-256"
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                false,
                ["decrypt"]
            );
    
            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: dataIv
                },
                key,
                encryptedData
            );  
    
            return new TextDecoder().decode(decryptedData);
        }
        static base64ToArrayBuffer(base64) {
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }
        static showOverlay() {
            const overlay = document.createElement('div');
            overlay.id = 'overlay';
        
            overlay.style.position = 'fixed';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.zIndex = '9999';
        
            const text = document.createElement('div');
            text.textContent = 'Deszyfrowanie...';
            text.style.color = 'white';
            text.style.fontSize = '2em';
            overlay.appendChild(text);
        
            document.body.appendChild(overlay);
        }
        
        static hideOverlay() {
            const overlay = document.getElementById('overlay');
            if (overlay) {
                overlay.remove();
            }
        }
        
    }
    customElements.define('encrypted-container', EncryptedContainer);


    document.body.appendChild(new EncryptedContainer('${encryptedDataString}', '${salt}', '${iv}', '${names["attemptsName"]}', '${names["lastAttemptTimeName"]}'));
    
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    function ctrlShiftKey(e, keyCode) {
        return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
    }

    document.onkeydown = (e) => {
    if (
        e.keyCode === 123 ||
        ctrlShiftKey(e, 'I') ||
        ctrlShiftKey(e, 'J') ||
        ctrlShiftKey(e, 'C') ||
        (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0))
    )
        return false;
    };

    function trackIntervalFunction(fn, interval) {
        const id = setInterval(() => {
            fn();
        }, interval);

        intervalFunctions.push({ id, fn, interval });
        }
        const intervalFunctions = [];
        function devtoolTrap(isEnabled) {
            function recursiveFunction(counter) {
                if (typeof isEnabled === 'string') {
                while (true) {}
                }
                check = isEnabled / isEnabled;  
                if (check.length !== 1 || isEnabled % 20 === 0) {
                (() => true).constructor('debugger').call('action');
                } else {
                (() => false).constructor('debugger').apply('stateObject');
                }
                recursiveFunction(++counter);
            }

            try {
                if (isEnabled) {
                return recursiveFunction;
                }

                recursiveFunction(0);
            } catch (error) {}
        }

        (() => {
        let devtoolsWindow;
        try {
            devtoolsWindow = {}.constructor('return this')();
        } catch (error) {
            devtoolsWindow = window;
        }

        trackIntervalFunction(devtoolTrap, 1000);
        })();
        
        function isFunctionInInterval(id, expectedInterval) {
            const intervalFunction = intervalFunctions.find((func) => func.id === id);
            if (intervalFunction) {
                return intervalFunction.interval === expectedInterval;
            }
            return false;
        }
        
        function intervalChecker() {
            try {
                let devtoolTrapId = intervalFunctions[0].id;

                if (!isFunctionInInterval(devtoolTrapId, 1000)) {
                    let encryptedContainers = document.querySelectorAll('encrypted-container');
                    encryptedContainers.forEach(container => {
                        container.remove();
                    });
                }
            } catch (error) {
                let encryptedContainers = document.querySelectorAll('encrypted-container');
                encryptedContainers.forEach(container => {
                    container.remove();
                });
            }
        }
        intervalChecker();
        setInterval(intervalChecker, 1000);
        

</script>
</body>
</html>
`.trimStart();;
}
