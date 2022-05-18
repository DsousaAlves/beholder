import React, { useState } from "react";
import useWebSocket from "react-use-websocket";
import Menu from '../../components/menu/Menu';
import MiniTicker from './miniTicker/MiniTicker';
import BookTicker from './bookTicker/BookTicker';

function Dashboard() {

    const [miniTickerState, setMiniTickerState] = useState({});

    const [bookState, setBookState] = useState({});

    const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_URL_WS, {
        onOpen: () => console.log('Connected to App WS Server'),
        onMessage: () => {
            if (lastJsonMessage) {
                if (lastJsonMessage.miniTicker) {
                    setMiniTickerState(lastJsonMessage.miniTicker);
                } else if (lastJsonMessage.book) {
                    lastJsonMessage.book.forEach(b => bookState[b.symbol] = b);
                    setBookState(bookState);
                }
            }
        },
        query: {},
        onError: (err) => console.log(err),
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000
    });

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
                </div>
            </main>
        </>
    )
}


export default Dashboard;