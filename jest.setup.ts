jest.mock('~/modules/telegram', () => {
    return {
        TelegramBot: jest.fn().mockImplementation(() => {
            return {
                sendMessage: jest.fn().mockResolvedValue({}),
            };
        }),
    };
});


jest.mock('~/modules/discord', () => {
    return {
        Discord: jest.fn().mockImplementation(() => {
            return {
                sendWebhook: jest.fn().mockResolvedValue({}),
            };
        }),
    };
});
