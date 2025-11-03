import { Controller, Get, Param, ParseUUIDPipe, Delete, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';

class CreateSubscriptionDto {
  userId: string;
  tier?: string; // default free_trial
}

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subs: SubscriptionsService) {}

  @Get()
  findAll() {
    return this.subs.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subs.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subs.create(dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subs.remove(id);
  }
}
