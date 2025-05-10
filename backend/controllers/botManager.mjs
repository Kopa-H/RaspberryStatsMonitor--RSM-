import dotenv from 'dotenv';
dotenv.config();

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Función para enviar un mensaje a Telegram
export const sendTelegramMessage = async (message) => {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.description || 'Error desconocido');
        }

        // console.log('Mensaje enviado a Telegram.');
    } catch (error) {
        console.error('Error al enviar mensaje a Telegram:', error.message);
    }
};
