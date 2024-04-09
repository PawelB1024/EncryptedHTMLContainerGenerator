function showOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    const text = document.createElement('div');
    text.style.fontSize = '2em';
    text.textContent = 'Generowanie...';
    overlay.appendChild(text);

    document.body.appendChild(overlay);
}
function hideOverlay() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.remove();
    }
}
document.getElementById('generate').addEventListener('click', async function() {
    const textToEncrypt = document.getElementById('inputText').value;
    const password = document.getElementById('password').value.trim();
    if (textToEncrypt && password) {
        try {
            showOverlay();
            let encryptedResult = await encryptText(textToEncrypt, password);
            const dataToSend = {
                encryptedDataString: encryptedResult.encryptedDataString,
                salt: encryptedResult.salt,
                iv: encryptedResult.iv,
            };
            const zipChecked = document.getElementById('zip').checked;
            const gdriveChecked = document.getElementById('gdrive').checked;  

            const response = await fetch('/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Zip-Checked': zipChecked,
                    'GDrive-Checked': gdriveChecked,  
                },
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                if(gdriveChecked){
                    const jsonResponse = await response.json();
                    window.open(jsonResponse.url, '_blank');
                }
                else {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const contentDisposition = response.headers.get('Content-Disposition');
                    const match = /filename="(.*)"/.exec(contentDisposition);
                    let fileName;
                    if(zipChecked)
                    {
                        fileName = match && match[1] ? match[1] : 'encryptedMessage.zip';
                    }
                    else
                    {
                        fileName = match && match[1] ? match[1] + ".html" : 'encryptedMessage.html';
                    }
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                }
            } else {
                if(gdriveChecked)
                {
                    alert("Błąd serwera, upewnij się że masz połączenie z internetem jeżeli chcesz wygenerować link google drive");
                }
                console.error("Błąd serwera:", response.status);
            }
        } catch (error) {
            alert("Błąd serwera, sprawdź konsole, skontaktuj się z deweloperem");
            console.error("Błąd:", error);
        } finally{
            hideOverlay();
        }
    } else {
        alert("Wprowadź tekst i hasło!");
    }
});
function generateSecurePassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}
document.getElementById('generateSafePass').addEventListener('click', () => {
    let generatedPassword = generateSecurePassword(12); 
    document.getElementById('password').value = generatedPassword;
});
async function encryptText(text, password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const salt = window.crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const key = await window.crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            salt: salt,
            iterations: 1000000,
            hash: "SHA-256"
        },
        keyMaterial,
        { "name": "AES-GCM", "length": 256 },
        false,
        ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12)); 
    const encryptedData = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
    );

    return { encryptedDataString: bufferToBase64(encryptedData), salt: bufferToBase64(salt), iv: bufferToBase64(iv) };
}
function bufferToBase64(buf) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
}