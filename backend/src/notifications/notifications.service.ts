import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly telegramChatId = process.env.TELEGRAM_CHAT_ID;

  constructor(
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  onModuleInit() {
    if (this.telegramToken && this.telegramChatId) {
      console.log('✅ Telegram is configured');
    } else {
      console.warn('⚠️ Telegram NOT configured');
    }
  }

  async notify(event: string, payload: any) {
    console.log(`[NOTIFY] ${event}`, payload);

    if (event !== 'order_created') return { ok: true };

    const order = payload?.order ?? payload;

    return {
      ok: true,
      telegram: await this.sendTelegramMessage(order),
    };
  }

  // 🔥 clean reusable function
  private async sendTelegramMessage(order: any) {
    if (!this.telegramToken || !this.telegramChatId) {
      return { status: 'disabled' };
    }

    try {
      const message = this.formatMessage(order);

      const url = `https://api.telegram.org/bot${this.telegramToken}/sendMessage`;

      const res = await axios.post(url, {
        chat_id: this.telegramChatId,
        text: message,
        parse_mode: 'Markdown',
      });

      console.log('✅ Telegram sent');
      return { status: 'sent', data: res.data };
    } catch (error) {
      console.error('❌ Telegram failed:', error.message);
      return { status: 'failed', error: error.message };
    }
  }

  // ✨ better message format
  private formatMessage(order: any): string {
    const product = order?.item ?? order?.productName ?? 'Unknown';
    const quantity = Number(order?.quantity ?? 1);
    const unitPrice = Number(order?.unitPrice ?? order?.price ?? 1);
    const total = (quantity * unitPrice).toFixed(2);
    const date = order?.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();

    return `
🛒 *New Order Created*


📦 Product: ${product}
➕ Quantity: ${quantity}
💰 Unit price: $${unitPrice}
🧾 Total: $${total}
📅 Date: ${date}
    `;
  }

  // 🧪 test function
  async sendTestTelegram(order: any) {
    return this.sendTelegramMessage(order);
  }
}