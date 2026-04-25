import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly telegramChatId = process.env.TELEGRAM_CHAT_ID;

  async sendMessage(message: string) {
    if (!this.telegramToken || !this.telegramChatId) {
      return { status: 'disabled' };
    }

    try {
      const url = `https://api.telegram.org/bot${this.telegramToken}/sendMessage`;

      const res = await axios.post(url, {
        chat_id: this.telegramChatId,
        text: message,
        parse_mode: 'Markdown',
      });

      return { status: 'sent', data: res.data };
    } catch (error: any) {
      return { status: 'failed', error: error.message };
    }
  }
  
}