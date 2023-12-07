import { MentionedUser } from '../types';
import { CastSelectResult } from './feed';
import prisma from '../prisma';

export const binarySearch = (arr: number[], target: number): number => {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid; // Target value found
    }

    if (arr[mid] < target) {
      left = mid + 1; // Search in the right half
    } else {
      right = mid - 1; // Search in the left half
    }
  }

  return -1; // Target not found
};

export const insertBytes = (
  originalArray: Uint8Array,
  newBytes: Uint8Array,
  insertPosition: number,
): Uint8Array => {
  // Create a new array with the size of the original array plus the new bytes
  let newArray = new Uint8Array(originalArray.length + newBytes.length);

  // Copy the first part of the original array (up to the insert position)
  newArray.set(originalArray.slice(0, insertPosition), 0);

  // Insert the new bytes
  newArray.set(newBytes, insertPosition);

  // Copy the remaining part of the original array (after the insert position)
  newArray.set(originalArray.slice(insertPosition), insertPosition + newBytes.length);

  return newArray;
};

export const getMentionedUsersInCasts = async <C extends CastSelectResult>(
  casts: C[],
): Promise<MentionedUser[]> => {
  const uniqueMentionedUserFids = new Set<bigint>();

  for (const cast of casts) {
    for (const mention of cast.mentions) {
      uniqueMentionedUserFids.add(mention);
    }
  }

  const mentionedUsers = (
    await prisma.user.findMany({
      select: {
        fid: true,
        username: true,
      },
      where: {
        fid: {
          in: [...uniqueMentionedUserFids],
        },
      },
    })
  ).filter((user) => user.username !== null) as MentionedUser[];

  return mentionedUsers;
};
