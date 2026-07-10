import { EventSubscriptionMethod, WebhookEvents } from '@phxgg/kick.js';
import { Request, Response } from 'express';

import { AccountModel } from '@/models/Account.js';
import { kickClientRegistry } from '@/services/kick-client-registry.js';

class WebController {
  home(req: Request, res: Response) {
    if (req.isAuthenticated()) return res.redirect('/dashboard');
    res.render('home');
  }

  async dashboard(req: Request, res: Response) {
    const user = req.user!;
    const account = await AccountModel.findOne({ provider: 'kick', providerAccountId: user.kickUserId });
    const events = req.kick ? await req.kick.events.fetch() : [];
    const chatSubscribed = events.some((sub) => sub.event === WebhookEvents.CHAT_MESSAGE_SENT);

    res.render('dashboard', {
      user,
      scopes: account?.scope ?? [],
      chatSubscribed,
      events,
    });
  }

  async subscribeToChat(req: Request, res: Response) {
    const client = await kickClientRegistry.get(req.user!.kickUserId);
    await client.events.subscribe({
      event: { name: WebhookEvents.CHAT_MESSAGE_SENT, version: 1 },
      method: EventSubscriptionMethod.WEBHOOK,
    });
    res.redirect('/dashboard');
  }

  async unsubscribeEvent(req: Request<{ id: string }>, res: Response) {
    await req.kick!.events.unsubscribe(req.params.id);
    res.redirect('/dashboard');
  }

  logout(req: Request, res: Response) {
    req.logout(() => res.redirect('/'));
  }
}

export const webController = new WebController();
