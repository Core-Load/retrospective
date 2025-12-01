import { Discord } from '~/modules/discord'
import { TelegramBot } from '~/modules/telegram'

import {
    DISCORD_WEBHOOK_URL,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
    TELEGRAM_MESSAGE_THREAD_ID,
} from '~/env'

export default async function broadcast(message: string) {
    const shouldSendToDiscord = DISCORD_WEBHOOK_URL
    const shouldSendToTelegram = (
        TELEGRAM_BOT_TOKEN &&
        TELEGRAM_CHAT_ID &&
        TELEGRAM_MESSAGE_THREAD_ID
    )

    return await Promise.all([
        shouldSendToDiscord && Discord.sendWebhook({
            url: DISCORD_WEBHOOK_URL,
            content: message,  
        }),
        shouldSendToTelegram && new TelegramBot(TELEGRAM_BOT_TOKEN)
            .sendMessage({
                chatId: TELEGRAM_CHAT_ID,
                messageThreadId: TELEGRAM_MESSAGE_THREAD_ID,
                text: message
         })
    ])
}