import { Command } from '@/src/types';

const commands = [
  {
    key: Command.Start,
    command: 'start',
    description: 'Start the bot',
  },
  {
    key: Command.EnableUpdates,
    command: 'enableupdates',
    description: 'Enable daily updates',
  },
  {
    key: Command.DisableUpdates,
    command: 'disableupdates',
    description: 'Disable daily updates',
  },
  {
    key: Command.ListChannels,
    command: 'channels',
    description: 'List subscribed channels',
  },
  {
    key: Command.AddChannels,
    command: 'subchannels',
    description: 'Subscribe to channels',
  },
  {
    key: Command.RemoveChannels,
    command: 'unsubchannels',
    description: 'Unsubscribe from channels',
  },
  {
    key: Command.Fetch,
    command: 'fetch',
    description: 'Fetch the latest updates',
  },
];

export const commandsMeta = commands.map((c) => ({
  command: c.command,
  description: c.description,
}));

export const command = (key: Command) => commands.find((meta) => meta.key === key)!.command;
