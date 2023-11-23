import { Command, MessageContext } from './types';

export const formatListWithAnd = (list: string[]): string => {
  if (list.length === 0) {
    return '';
  } else if (list.length === 1) {
    return list[0];
  } else if (list.length === 2) {
    return list[0] + ' and ' + list[1];
  } else {
    const lastItem = list.pop();
    return list.join(', ') + ', and ' + lastItem;
  }
};

export const getSessionCommand = (ctx: MessageContext): Command | undefined => {
  return ctx.session?.command;
};

export const pluralize = (text: string, array: any[]) => {
  return array.length > 1 ? text + 's' : text;
};
