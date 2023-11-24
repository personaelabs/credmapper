import { Context, NarrowedContext } from 'telegraf';
import { Message, Update } from 'telegraf/types';

export interface ParsedLensPost {
  publicationUrl: string;
}

export interface IndexedCast {
  text: string;
  timestamp: Date;
  address: string;
  hash: string;
  username: string;
  ogpImage: string;
  images: string[];
}

export enum Command {
  Start = 'start',
  ListChannels = 'listChannels',
  AddChannels = 'addChannels',
  RemoveChannels = 'removeChannels',
  EnableUpdates = 'enableUpdates',
  DisableUpdates = 'disableUpdates',
  Fetch = 'fetch',
}

export interface ContextWithSession extends Context {
  session?: {
    command?: Command;
  };
}

export type MessageContext = NarrowedContext<ContextWithSession, Update.MessageUpdate<Message>>;
