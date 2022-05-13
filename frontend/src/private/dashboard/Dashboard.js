import React, { useState } from "react";
import useWebSocket from 'react-use-websocket';


function Dashboard() {

    const [tickerState, setTickerState] = useState({});

    const { lastJsonMessage } = useWebSocket(process.env.REACT_APP_URL_WS, {
        onOpen: () => console.log('Connected to App WS Server'),
        onMessage: () => {
            if (lastJsonMessage) {
                if (lastJsonMessage.miniTicker) {
                    setTickerState(lastJsonMessage.miniTicker);
                }
            }
        },
        queryParams: {},
        onError: (err) => console.log(err),
        shouldReconnect: (cloneElement) => true,
        reconnectInterval: 3000
    });

    return (
        <React.Fragment>
            {JSON.stringify(tickerState)}
        </React.Fragment>
    );
}

export default Dashboard;