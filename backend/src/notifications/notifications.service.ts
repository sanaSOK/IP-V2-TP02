import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { EVENT_PUBLISHER } from 'src/core/tokens';
import { TelegramService } from '../telegram/telegram.service';
import { ReceiptsService } from '../receipts/receipts.service';

type EventPublisher = { publish: (event: string, payload: any) => void };

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
    private readonly telegramService: TelegramService,
    @Inject(forwardRef(() => ReceiptsService))
    private readonly receiptsService: ReceiptsService,
  ) {}

  notify(event: string, payload: any) {
    this.publisher.publish(event, payload);
    return { ok: true };
  }

  async notifyOrderCreated(orderData: {
    id: string;
    item: string;
    quantity: number;
    unitPrice: number;
  }) {
    try {
      // 📱 Send Telegram notification
      const totalPrice = orderData.quantity * orderData.unitPrice;
      const now = new Date();
      const formattedDate = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const message = `
      📦 *New Order Created*
      ━━━━━━━━━━━━━━━━━━━━
      Date: ${formattedDate}
      Item: ${orderData.item}
      Quantity: ${orderData.quantity}
      Unit Price: $${orderData.unitPrice}
      Total: $${totalPrice}
      Order ID: \`${orderData.id}\`
      ━━━━━━━━━━━━━━━━━━━━
      `;

      const telegramResult = await this.telegramService.sendMessage(message);
      this.logger.log(`Telegram notification sent: ${telegramResult.status}`);

      // 🧾 Create receipt after notification
      const receipt = await this.receiptsService.create({
        issuedAt: new Date().toISOString(),
        name: orderData.item,
        price: totalPrice,
      });

      this.logger.log(`Receipt created: ${receipt._id}`);

      return {
        ok: true,
        telegram: telegramResult,
        receipt: receipt,
      };
    } catch (error: any) {
      this.logger.error(`Error notifying order creation: ${error.message}`, error);
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}