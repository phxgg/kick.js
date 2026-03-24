import { createLogger } from '@/winston.logger.js';

import { KickClient } from '@/KickAPI/KickClient.js';
import { EventSubscriptionMethod } from '@/KickAPI/services/EventsService.js';
import { WebhookEventNames } from '@/KickAPI/webhooks/WebhookEvents.js';
import { CategoriesQuerySchema } from '@/validators/query/categories-query.validator.js';

const logger = createLogger('TestService');

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

  async getCategories(kick: KickClient, query: CategoriesQuerySchema) {
    // const categories = await kick.categoriesV2.search({ limit: 10 });
    const categories = await kick.categoriesV2.search(query);
    return categories;
  }

  async getCategory(kick: KickClient, id: number) {
    const category = await kick.categoriesV2.fetch(id);
    return category;
  }

  async introspectToken(kick: KickClient) {
    const introspection = await kick.oauth.introspect();
    return introspection;
  }
}

export const testService = new TestService();
