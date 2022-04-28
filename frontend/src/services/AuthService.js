import axios from 'axios';

const API_URL = process.env.REACT_APP_URL_API || 3001;

export async function doLogin(email, password) {
    const urlLogin = `${API_URL}/login`;
    const response = await axios.post(urlLogin, {email, password});
    return response.data;
}


export async function doLogout(token) {
    const urlLogin = `${API_URL}/logout`;
    const headers = {'authorization': token};
    const response = await axios.post(urlLogin, {}, { headers });
    return response.data;
}