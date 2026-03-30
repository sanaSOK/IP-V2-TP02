import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

class SendTestDto {
  telegramToken?: string;
  telegramChatId?: string;
  order?: any;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('test')
  async test() {
    const sampleOrder = { item: 'Test order', quantity: 1, unitPrice: 1 };
    return this.notificationsService.notify('order_created', { order: sampleOrder });
  }

  @Post('test/send')
  async sendTest(@Body() body: SendTestDto) {
    const sampleOrder = body.order ?? { item: 'Manual test order', quantity: 1, unitPrice: 1 };
    
  }
}
