import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import useWebSocket from "react-use-websocket";
import Menu from '../../components/menu/Menu';
import MiniTicker from './miniTicker/MiniTicker';
import BookTicker from './bookTicker/BookTicker';
import Wallet from './wallet/Wallet';

function Dashboard() {

    const history = useHistory();

    const [miniTickerState, setMiniTickerState] = useState({});

    const [bookState, setBookState] = useState({});

    const [balanceState, setBalanceState] = useState({});

    const [wallet, setWallet] = useState({});

    const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_URL_WS, {
        onOpen: () => console.log('Connected to App WS Server'),
        onMessage: () => {
            if (lastJsonMessage) {
                if (lastJsonMessage.miniTicker) {
                    setMiniTickerState(lastJsonMessage.miniTicker);
                } else if (lastJsonMessage.book) {
                    lastJsonMessage.book.forEach(b => bookState[b.symbol] = b);
                    setBookState(bookState);
                } else if (lastJsonMessage.balance) {
                    setBalanceState(lastJsonMessage.balance);
                }
            }
        },
        query: {},
        onError: (err) => console.log(err),
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    });

    function onWalletUpdate(walletObj) {
        setWallet(walletObj);
    }

    function onSubmitOrder(order) {
        history.push('/orders/' + order.symbol);
    }

    return (
        <>
            <Menu />
            <main className="content">
                <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                    <div className="d-block mb-4 mb-md-0">
                        <h1 className="h4">Dashboard</h1>
                    </div>
                </div>
                <div>Gráfico de candles</div>

                <div className="row">
                    <div className="col-12">
                        <MiniTicker data={miniTickerState} />
                    </div>
                </div>

                <div className="row">
                    <BookTicker data={bookState} />
                    <Wallet data={balanceState} onUpdate={onWalletUpdate} />
                </div>
            </main>
            <NewOrderModal wallet={wallet} onSubmit={onSubmitOrder} />
        </>
    )
}


export default Dashboard;