import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateCheckout } from './usecases/create-checkout.usecase';
import { ManageBilling } from './usecases/manage-billing.usecase';
import { UpdatePlan } from './usecases/update-plan.usecase';
import { DeleteBillingInfo } from './usecases/delete-billing-info.usecase';
import { AuthenticatedGuard } from '../auth/guards/auth.guard';
import { MembershipGuard } from '../workspace/framework/membership.guard';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { Membership } from '../workspace/framework/membership.decorator';
import { Member, MemberRole } from '@purly/database';
import { AllowedRole } from '../workspace/framework/allowed-role.decorator';
import { OnStripeEvent } from './stripe/stripe.event';
import { StripeEvents } from './stripe/stripe.webhook';
import { Plans, getNameByPriceId } from './stripe/stripe.constants';
import Stripe from 'stripe';

@Controller('billing/:workspaceId')
@UseGuards(AuthenticatedGuard, MembershipGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class BillingController {
  constructor(
    private readonly createCheckoutUsecase: CreateCheckout,
    private readonly manageBillingUsecase: ManageBilling,
    private readonly updatePlanUsecase: UpdatePlan,
    private readonly deleteBillingInfoUsecase: DeleteBillingInfo
  ) {}

  @Post('checkout')
  @AllowedRole(MemberRole.OWNER)
  createCheckout(
    @Body() body: CreateCheckoutDto,
    @Membership() member: Member
  ) {
    return this.createCheckoutUsecase.execute({
      plan: body.plan,
      workspaceId: member.workspaceId,
    });
  }

  @Get('manage')
  @AllowedRole(MemberRole.OWNER)
  manageBilling(@Membership() member: Member) {
    return this.manageBillingUsecase.execute({
      workspaceId: member.workspaceId,
    });
  }

  @Delete()
  @AllowedRole(MemberRole.OWNER)
  async deleteBilling(@Membership() member: Member) {
    const isDeleted = await this.deleteBillingInfoUsecase.execute({
      workspaceId: member.workspaceId,
    });

    return { success: isDeleted };
  }

  @OnStripeEvent(StripeEvents.UpdateSubscription)
  async updateSubscription(payload: Stripe.Subscription) {
    await this.updatePlanUsecase.execute({
      billingId: payload.customer.toString(),
      plan: this.getPlanForSubscription(payload),
    });
  }

  @OnStripeEvent(StripeEvents.DeleteSubscription)
  async deleteSubscription(payload: Stripe.Subscription) {
    await this.updatePlanUsecase.execute({
      billingId: payload.customer.toString(),
      plan: Plans.FREE,
    });
  }

  private getPlanForSubscription(payload: Stripe.Subscription) {
    const priceId = payload.items.data[0].price.id;
    if (!priceId) {
      // log and report case like this.
      throw new BadRequestException('Price ID is required');
    }

    const foundPriceId = getNameByPriceId(priceId);
    if (!foundPriceId) {
      throw new BadRequestException('Price ID is invalid');
    }

    return foundPriceId;
  }
}
