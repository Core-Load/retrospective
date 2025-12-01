import axios from 'axios';

interface TelegramUpdate {
    update_id: number;
    message: TelegramMessage;
}

interface TelegramMessage {
    message_id: number;
    from: TelegramUser;
    chat: TelegramChat;
    date: number;
    text: string;
}

interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name: string;
    username: string;
    language_code: string;
}

interface TelegramChat {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    type: string;
}

export class TelegramBot {
    private token: string;
    private url: string;

    constructor(token: string) {
        this.token = token;
        this.url = `https://api.telegram.org/bot${this.token}`;
    }

    async getUpdates(): Promise<TelegramUpdate[]> {
        const response = await axios.get(`${this.url}/getUpdates`);
        return response.data;
    }

    async sendMessage({
        chatId,
        text,
        messageThreadId,
    }: {
        chatId: string;
        text: string;
        messageThreadId?: string;
    }): Promise<TelegramMessage> {
        const response = await axios.post(`${this.url}/sendMessage`, {
            chat_id: chatId,
            text,
            message_thread_id: messageThreadId,
        });
        return response.data;
    }
}
