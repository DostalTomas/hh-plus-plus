const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Nastav cestu k souboru, který chceme zpřístupnit
    const filePath = path.join(__dirname, 'krtek-tweaks.user.js');

    // Kontrola požadovaného URL
    if (req.url === '/krtek-tweaks.user.js') {
        // Čti soubor a odešli obsah jako odpověď
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(data);
            }
        });
    } else {
        // Defaultní odpověď pro ostatní cesty
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Nastav port serveru
const PORT = 4444;
server.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});
