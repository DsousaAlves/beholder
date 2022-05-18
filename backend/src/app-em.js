const WebSocket = require('ws');
const crypto = require('./utils/crypto');

module.exports = (settings, wss) => {

    if (!settings) throw new Error(`Can't start Exchange Monitor without settings!`);

    settings.secretKey = crypto.decrypt(settings.secretKey);
    const exchange = require('./utils/exchange')(settings);

    exchange.miniTickerStream((markets) => {
        if (!wss || !wss.clients) return;

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({miniTicker: markets}));
            }
        })
    });

    let book = [];
    exchange.bookStream((orders) => {
        if (book.length === 200) {
            if (!wss || !wss.clients) return;

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({book}));
                }
            })
            book = [];
        } else {
            book.push({...orders});
        }
    });

    console.log('App Exchange Monitor is running');
}