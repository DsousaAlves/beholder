import React, { useState } from "react";
import useWebSocket from "react-use-websocket";

function Dashboard() {

    const [miniTickerState, setMiniTickerState] = useState({});

    const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_URL_WS, {
        onOpen: () => console.log('Connected to App WS Server'),
        onMessage: () => {
            if (lastJsonMessage) {
                if (lastJsonMessage.miniTicker) {
                    setMiniTickerState(lastJsonMessage.miniTicker);
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
            {JSON.stringify(miniTickerState)}
        </>
    )
}


export default Dashboard;