import { Event } from '@prisma/client';
import db, { ExtendedPrismaClient } from '../../context';
import { createNotification } from './events';

interface NotificationEvent {
  recepientId: string;
  recepientName: string;
  originatorId: string;
  type: Event;
  link: string;
  resourceId: string;
  timestamp: number;
}

interface QueuedNotification {
  events: NotificationEvent[];
  lastUpdated: number;
}

class NotificationQueue {
  private static instance: NotificationQueue;
  private queue: Map<string, QueuedNotification> = new Map();
  private db: ExtendedPrismaClient;

  private constructor(db: ExtendedPrismaClient) {
    this.db = db;
    console.log('NotificationQueue: Initializing');
    this.startWorker();
  }

  public static getInstance(db: ExtendedPrismaClient): NotificationQueue {
    if (!NotificationQueue.instance) {
      console.log('NotificationQueue: Creating new instance');
      NotificationQueue.instance = new NotificationQueue(db);
    }
    return NotificationQueue.instance;
  }

  addEvent(event: NotificationEvent) {
    const key = `${event.recepientId}:${event.type}:${event.resourceId}`;
    console.log(`NotificationQueue: Adding event with key ${key}`, event);
    const existingEntry = this.queue.get(key);

    if (existingEntry) {
      console.log(`NotificationQueue: Existing entry found for key ${key}`);
      const existingEventIndex = existingEntry.events.findIndex(
        (e) => e.originatorId === event.originatorId,
      );
      if (existingEventIndex !== -1) {
        console.log(`NotificationQueue: Updating existing event for originator ${event.originatorId}`);
        existingEntry.events[existingEventIndex] = event;
      } else {
        console.log(`NotificationQueue: Adding new event for originator ${event.originatorId}`);
        existingEntry.events.push(event);
      }
      existingEntry.lastUpdated = Date.now();
    } else {
      console.log(`NotificationQueue: Creating new entry for key ${key}`);
      this.queue.set(key, {
        events: [event],
        lastUpdated: Date.now(),
      });
    }
    console.log(`NotificationQueue: Queue size is now ${this.queue.size}`);
  }

  private async processQueue() {
    console.log('NotificationQueue: Processing queue');
    const now = Date.now();
    for (const [key, queuedNotification] of this.queue.entries()) {
      if (now - queuedNotification.lastUpdated < 2000) {
        console.log(`NotificationQueue: Skipping recent entry for key ${key}`);
        continue; // Skip if less than 2 seconds old
      }

      console.log(`NotificationQueue: Processing entry for key ${key}`);
      const [recepientId, type, resourceId] = key.split(':');
      const latestEvent =
        queuedNotification.events[queuedNotification.events.length - 1];

      try {
        await createNotification({
          db: this.db,
          recepientId,
          recepientName: latestEvent.recepientName,
          originatorId: latestEvent.originatorId,
          type: latestEvent.type,
          link: latestEvent.link,
          resourceId,
          participants: queuedNotification.events.map((e) => ({
            id: e.originatorId,
          })),
          squashedCount: queuedNotification.events.length - 1,
        });
        console.log(`NotificationQueue: Created notification for key ${key}`);
      } catch (error) {
        console.error(`NotificationQueue: Error creating notification for key ${key}`, error);
      }

      this.queue.delete(key);
      console.log(`NotificationQueue: Removed entry for key ${key}. Queue size is now ${this.queue.size}`);
    }
  }

  private startWorker() {
    console.log('NotificationQueue: Starting worker');
    setInterval(() => this.processQueue(), 1000 * 60 * 3); // Process every 3 minutes
  }
}

export const notificationQueue = NotificationQueue.getInstance(db);