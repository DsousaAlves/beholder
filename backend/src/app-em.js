const ordersRepository = require('./repositories/ordersRepository');
const { monitorTypes, getActiveMonitors } = require('./repositories/monitorsRepository');
const { execCalc, indexKeys } = require('./utils/indexes');
const logger = require('./utils/logger');

let WSS, beholder, exchange;


async function init(settings, wssInstance, beholderInstance) {
    if (!settings || !beholderInstance) throw new Error(`You can't init the Exchange Monitor App without his settings. Check your database and/or startup code.`);

    WSS = wssInstance;
    beholder = beholderInstance;
    exchange = require('./utils/exchange')(settings);

    const monitors = await getActiveMonitors();
    monitors.map(m => {
        setTimeout(() => {
            switch (m.type) {
                case monitorTypes.MINI_TICKER:
                    return startMiniTickerMonitor(m.id, m.broadcastLabel, m.logs);
                case monitorTypes.BOOK:
                    return startBookMonitor(m.id, m.broadcastLabel, m.logs);
                case monitorTypes.USER_DATA: {
                    if (!settings.accessKey || !settings.secretKey) return;
                    return startUserDataMonitor(m.id, m.broadcastLabel, m.logs);
                }
                case monitorTypes.CANDLES:
                    return startChartMonitor(m.id, m.symbol, m.interval, m.indexes ? m.indexes.split(',') : [], m.broadcastLabel, m.logs);
                // case monitorTypes.TICKER:
                //     return startTickerMonitor(m.id, m.symbol, m.broadcastLabel, m.logs);
            }
        }, 250)//Binance only permits 5 commands / second
    })

    // logger('system', 'App Exchange Monitor is running!');
    logger('system', 'App Exchange Monitor is running!');
}

function startMiniTickerMonitor(monitorId, broadcastLabel, logs) {
    if (!exchange) return new Error('Exchange Monitor not initialized yet.');
    exchange.miniTickerStream(async (markets) => {
        if (logs) logger('M:' + monitorId, markets);

        try {
            Object.entries(markets).map(async (mkt) => {

                delete mkt[1].volume;
                delete mkt[1].quoteVolume;
                delete mkt[1].eventTime;
                const converted = {};
                Object.entries(mkt[1]).map(prop => converted[prop[0]] = parseFloat(prop[1]));
                const results = await beholder.updateMemory(mkt[0], indexKeys.MINI_TICKER, null, converted);
                if (results) results.map(r => sendMessage({ notification: r }));
            })

            if (broadcastLabel && WSS) {
                // sendMessage({ [broadcastLabel]: markets });
                WSS.broadcast({ [broadcastLabel]: markets });
            }
        } catch (err) {
            if (logs) logger('M:' + monitorId, err)
        }
    })
    logger('M:' + monitorId, 'Mini Ticker Monitor has started!');
}

let book = [];
function startBookMonitor(monitorId, broadcastLabel, logs) {
    if (!exchange) return new Error('Exchange Monitor not initialized yet.');
    exchange.bookStream(async (order) => {
        if (logs) logger('M:' + monitorId, order);

        try {
            if (book.length === 200) {
                if (broadcastLabel && WSS) {
                    // sendMessage({ [broadcastLabel]: book });
                    WSS.broadcast({ [broadcastLabel]: book});
                } 
                book = [];
            }
            else {
                book.push({ ...order });
            }

            const orderCopy = { ...order };
            delete orderCopy.symbol;
            delete orderCopy.updateId;
            delete orderCopy.bestAskQty;
            delete orderCopy.bestBidQty;

            const converted = {};
            Object.entries(orderCopy).map(prop => converted[prop[0]] = parseFloat(prop[1]));

            const currentMemory = beholder.getMemory(order.symbol, indexKeys.BOOK);

            const newMemory = {};
            newMemory.previous = currentMemory ? currentMemory.current : converted;
            newMemory.current = converted;

            const results = await beholder.updateMemory(order.symbol, indexKeys.BOOK, null, newMemory);
            // if (results) results.map(r => sendMessage({ notification: r }));
        } catch (err) {
            if (logs) logger('M:' + monitorId, err);
        }
    })
    logger('M:' + monitorId, 'Book Monitor has started!');
}

async function startUserDataMonitor(monitorId, broadcastLabel, logs) {
    const [balanceBroadcast, executionBroadcast] = broadcastLabel ? broadcastLabel.split(',') : [null, null];

    try {
        await loadWallet();

        if (!exchange) return new Error('Exchange Monitor not initialized yet.');
        // exchange.userDataStream(data => {
        //     if (data.e === 'executionReport')
        //         processExecutionData(monitorId, data, executionBroadcast);
        //     else if (data.e === 'balanceUpdate')
        //         processBalanceData(monitorId, balanceBroadcast, logs, data)
        // })

        exchange.userDataStream(
            balanceData => {
                if (logs) {
                    console.log(balanceData);
                }
                const wallet = loadWallet();
                if (broadcastLabel && WSS) {
                    WSS.broadcast({ [broadcastLabel]: wallet });
                }
            },
            executionData => {
                if (logs) {
                    console.log(executionData);
                }
                processExecutionData(executionData, broadcastLabel);
            }
        )

        logger('M:' + monitorId, 'User Data Monitor has started!');
    } catch (err) {
        logger('M:' + monitorId, 'User Data Monitor has NOT started!\n' + err.message);
    }
}

async function loadWallet() {
    if (!exchange) throw new Error('Exchange Monitor not initialized yet.');

    try {
        const info = await exchange.balance();
        const wallet = Object.entries(info).map(async (item) => {
            const results = await beholder.updateMemory(item[0], indexKeys.WALLET, null, parseFloat(item[1].available));
            // if (results) {
            //     results.map(r => sendMessage({ notification: r }));
            // }

            return {
                symbol: item[0],
                available: item[1].available,
                onOrder: item[1].onOrder
            }
        })
        // return Promise.all(wallet);
        return wallet;
    } catch (err) {
        throw new Error(err.body ? JSON.stringify(err.body) : err.message);//evita 401 da Binance
    }
}

function processExecutionData(executionData, broadcastLabel) {
    if (executionData.x === 'NEW') return;//ignora as novas, pois podem ter vindo de outras fontes

    const order = {
        symbol: executionData.s,
        orderId: executionData.i,
        clientOrderId: executionData.X === 'CANCELED' ? executionData.C : executionData.c,
        side: executionData.S,
        type: executionData.o,
        status: executionData.X,
        isMaker: executionData.m,
        transactTime: executionData.T
    }

    if (order.status === 'FILLED') {
        const quoteAmount = parseFloat(executionData.Z);
        order.avgPrice = quoteAmount / parseFloat(executionData.z);
        order.commission = executionData.n;

        const isQuoteCommission = executionData.N && order.symbol.endsWith(executionData.N);
        order.net = isQuoteCommission ? quoteAmount - parseFloat(order.commission) : quoteAmount;
    }

    if (order.status === 'REJECTED') order.obs = executionData.r;

    setTimeout(() => {
        ordersRepository.updateOrderByOrderId(order.orderId, order.clientOrderId, order)
            .then(order => {
               if( order ) {
                   beholder.updateMemory(order.symbol, indexKeys.LAST_ORDER, null, order );
                   if (broadcastLabel && WSS) {
                       WSS.broadcast({ [broadcastLabel]: order })
                    }
               }
            })
            .catch(err => console.error(err));
    }, 3000)
}

function startChartMonitor(monitorId, symbol, interval, indexes, broadcastLabel, logs) {
    if (!symbol) return new Error(`Can't start a Chart Monitor without a symbol.`);
    if (!exchange) return new Error('Exchange Monitor not initialized yet.');

    exchange.chartStream(symbol, interval || '1m', async (ohlc) => {
        const lastCandle = {
            open: ohlc.open[ohlc.open.length - 1],
            close: ohlc.close[ohlc.close.length - 1],
            high: ohlc.high[ohlc.high.length - 1],
            low: ohlc.low[ohlc.low.length - 1],
            volume: ohlc.volume[ohlc.volume.length - 1],
        };

        if (logs) logger('M:' + monitorId, lastCandle);

        try {
            // beholder.updateMemory(symbol, indexKeys.LAST_CANDLE, interval, lastCandle, false);

            if (broadcastLabel && WSS) {
                //  sendMessage({ [broadcastLabel]: lastCandle }); 
                if (broadcastLabel && WSS) {
                    WSS.broadcast({ [broadcastLabel]: lastCandle });
                }
            }

            let results = await processChartData(monitorId, symbol, indexes, interval, ohlc, logs);

            // results.push(await beholder.testAutomations(beholder.parseMemoryKey(symbol, indexKeys.LAST_CANDLE, interval)));

            // if (results) {
            //     if (logs) logger('M:' + monitorId, `chartStream Results: ${results}`);
            //     results.flat().map(r => sendMessage({ notification: r }));
            // }
        } catch (err) {
            if (logs) logger('M:' + monitorId, err);
        }
    })
    logger('M:' + monitorId, `Chart Monitor has started for ${symbol}_${interval}!`);
}

async function processChartData(monitorId, symbol, indexes, interval, ohlc, logs) {
    if (typeof indexes === 'string') indexes = indexes.split(',');
    if (!indexes || !Array.isArray(indexes) || indexes.length === 0) return false;

    const memoryKeys = [];

    // indexes.map(index => {
    //     const params = index.split('_');
    //     const indexName = params[0];
    //     params.splice(0, 1);

    //     try {
    //         const calc = execCalc(indexName, ohlc, ...params);
    //         if (logs) logger('M:' + monitorId, `${index}_${interval} calculated: ${JSON.stringify(calc.current ? calc.current : calc)}`);
    //         beholder.updateMemory(symbol, index, interval, calc, false);

    //         memoryKeys.push(beholder.parseMemoryKey(symbol, index, interval));
    //     } catch (err) {
    //         logger('M:' + monitorId, `Exchange Monitor => Can't calc the index ${index}:`);
    //         logger('M:' + monitorId, err);
    //     }
    // });

    // return Promise.all(memoryKeys.map(async (key) => {
    //     return beholder.testAutomations(key);
    // }))
}

module.exports = {
    init,
    startChartMonitor
}
