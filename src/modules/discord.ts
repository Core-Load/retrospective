import axios from 'axios';

export class Discord {
    static async sendWebhook({
        url,
        content,
    }: {
        url: string
        content: string
    }) {
        const response = await axios.post(url, {
            content,
        });
        return response.data;
    }
}