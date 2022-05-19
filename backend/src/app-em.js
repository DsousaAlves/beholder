const WebSocket = require('ws');

module.exports = (settings, wss) => {

    if (!settings) throw new Error(`Can't start Exchange Monitor without settings!`);

    const exchange = require('./utils/exchange')(settings);

    function broadcast(jsonObject) {
        if (!wss || !wss.clients) return;
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(jsonObject));
            }
        });
    }

    exchange.miniTickerStream((markets) => {
        broadcast({miniTicker: markets});
    });

    let book = [];
    exchange.bookStream((orders) => {
        if (book.length === 200) {
            book = [];
            broadcast({book});
        } else {
            book.push({...orders});
        }
    });

    // function processExecutionData(executionData) {
    //     if (executionData.x === orderStatus.NEW) return;//ignora as novas, pois podem ter vindo de outras fontes

    //     const order = {
    //         symbol: executionData.s,
    //         orderId: executionData.i,
    //         clientOrderId: executionData.X === orderStatus.CANCELED ? executionData.C : executionData.c,
    //         side: executionData.S,
    //         type: executionData.o,
    //         status: executionData.X,
    //         isMaker: executionData.m,
    //         transactTime: executionData.T
    //     }

    //     if (order.status === orderStatus.FILLED) {
    //         const quoteAmount = parseFloat(executionData.Z);
    //         order.avgPrice = quoteAmount / parseFloat(executionData.z);
    //         order.commission = executionData.n;

    //         const isQuoteCommission = executionData.N && order.symbol.endsWith(executionData.N);
    //         order.net = isQuoteCommission ? quoteAmount - parseFloat(order.commission) : quoteAmount;
    //     }

    //     if (order.status === orderStatus.REJECTED) order.obs = executionData.r;

    //     setTimeout(() => {
    //         ordersRepository.updateOrderByOrderId(order.orderId, order.clientOrderId, order)
    //             .then(order => order && broadcast({ execution: order }))
    //             .catch(err => console.error(err));
    //     }, 3000)
    // }

    exchange.userDataStream(
        balanceData => {
            broadcast({ balance: balanceData });
        },
        executionData => {
            // processExecutionData(executionData)
            console.log(executionData);
        }
    )

    console.log('App Exchange Monitor is running');
}