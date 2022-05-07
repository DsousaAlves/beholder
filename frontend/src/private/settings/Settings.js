import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { getSettings } from "../../services/SettingsService";
import Menu from '../../components/menu/Menu';

import {doLogout} from '../../services/AuthService';


function Settings() {

    const history = useHistory();
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({
        email: '',
        apiUrl: '',
        accessKey: '',
        keySecret: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        getSettings(token)
            .then(response => {
                setSettings(response);
            })
            .catch(err => {
                console.log(err);
                if (err.response && err.response.status === 401) {
                    console.log(err.response.status);
                    history.push('/');
                }

                if (err.response) {
                    setError(err.response.data);
                } else {
                    setError(err.message);
                }

                // console.error('settings::useEffect::getSettings', err.response.data);
            });
    }, []);

    return (
        <>
            <Menu />
            <p>Hello Settings: { settings.email }</p>
        </>
    );
}

export default Settings;