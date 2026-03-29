import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
   
    private readonly telegramToken = process.env.TELEGRAM_BOT_TOKEN || null;
    private readonly telegramChatId = process.env.TELEGRAM_CHAT_ID || null;

    constructor(
        @Inject(forwardRef(() => OrdersService))
        private readonly ordersService: OrdersService,
    ) {}

    onModuleInit() {
        // Email support removed. Telegram only.
        if (this.telegramToken && this.telegramChatId) {
            console.log('NotificationsService: Telegram configured');
        } else {
            console.warn('NotificationsService: Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)');
        }
    }

    async notify(event: string, payload: any) {
        console.log(`[NOTIFY] ${event}`, payload);

        // Only act on order_created for now
        if (event !== 'order_created') return { ok: true };

        const order = payload?.order ?? payload;
        const results: any = { ok: true };

        // Send Telegram if configured
        if (this.telegramToken && this.telegramChatId) {
            try {
                const tgText = `New order created:\n${JSON.stringify(order)}`;
                const url = `https://api.telegram.org/bot${this.telegramToken}/sendMessage`;
                const resp = await axios.post(url, {
                    chat_id: this.telegramChatId,
                    text: tgText,
                    parse_mode: 'Markdown',
                });
                console.log('Telegram notification sent', resp.data);
                results.telegram = { status: 'sent', data: resp.data };
            } catch (err) {
                console.warn('Failed to send Telegram notification', err?.toString ? err.toString() : err);
                results.telegram = { status: 'failed', error: String(err) };
            }
        } else {
            results.telegram = { status: 'disabled' };
        }

        return results;
    }

    // send a test telegram message using supplied token/chatId (does not change env)
    async sendTestTelegram(order: any, token?: string, chatId?: string) {
        const usedToken = token || this.telegramToken;
        const usedChat = chatId || this.telegramChatId;
        if (!usedToken || !usedChat) {
            return { ok: false, reason: 'telegram_not_configured' };
        }

        try {
            const tgText = `Test order notification:\n${JSON.stringify(order)}`;
            const url = `https://api.telegram.org/bot${usedToken}/sendMessage`;
            const resp = await axios.post(url, {
                chat_id: usedChat,
                text: tgText,
                parse_mode: 'Markdown',
            });
            return { ok: true, telegram: { status: 'sent', data: resp.data } };
        } catch (err) {
            return { ok: false, telegram: { status: 'failed', error: String(err) } };
        }
    }
}
