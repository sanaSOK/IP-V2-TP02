import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

class SendTestDto {
  order?: any;
}

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  // 🔹 Trigger event (recommended way)
  @Get('test')
  async test() {
    const sampleOrder = { item: 'Test order', quantity: 1, unitPrice: 1 };

    return this.notificationsService.notify('order_created', {
      order: sampleOrder,
    });
  }

  // 🔹 Manual test (still goes through event system)
  @Post('test/send')
  async sendTest(@Body() body: SendTestDto) {
    const sampleOrder =
      body.order ?? { item: 'Manual test order', quantity: 1, unitPrice: 1 };

    return this.notificationsService.notify('order_created', {
      order: sampleOrder,
    });
  }
}