import logger from '@/winston.logger';

import { KickClient } from '@/KickAPI/KickClient';
import { EventSubscriptionMethod } from '@/KickAPI/services/EventsService';
import { WebhookEventNames } from '@/KickAPI/webhooks/WebhookEvents';

class TestService {
  async getSubscribedEvents(kick: KickClient) {
    return kick.events.fetch();
  }

  async subscribeToEvent(kick: KickClient, eventName: WebhookEventNames) {
    const me = await kick.users.me();
    const subscription = await kick.events.subscribe({
      broadcasterUserId: me.userId,
      event: { name: eventName, version: 1 },
      method: EventSubscriptionMethod.WEBHOOK,
    });
    if (subscription.error) {
      logger.error(`Failed to subscribe to event`, { subscription });
      throw new Error('Failed to subscribe to event');
    }
    logger.info(subscription);
    return subscription;
  }

  async unsubscribeFromAllEvents(kick: KickClient) {
    const subscriptions = await kick.events.fetch();
    await kick.events.unsubscribeMultiple(subscriptions.map((sub) => sub.id));
  }
}

export const testService = new TestService();
