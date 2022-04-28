import axios from 'axios';

const API_URL = process.env.REACT_APP_URL_API || 3001;

export async function getSettings(token) {
    const url = `${API_URL}/settings`;
    const headers = {
        'authorization': token
    }
    const response = await axios.get(url,  { headers });
    return response.data;
}