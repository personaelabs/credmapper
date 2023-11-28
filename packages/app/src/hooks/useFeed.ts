import { useRef, useState, useEffect, useCallback } from 'react';
import { FeedItemData, FetchOptions } from '../types';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const useFeed = (): {
  feed: FeedItemData[];
  getFeed: (options?: FetchOptions) => void;
  fetchMore: () => void;
  hasNextPage: boolean;
} => {
  const [feed, setFeed] = useState<FeedItemData[]>([]);
  const [options, setOptions] = useState<FetchOptions>({});
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const hasRunOnce = useRef(false);

  const getFeed = useCallback(
    (newOptions: FetchOptions = {}) => {
      (async () => {
        let url = `${API_URL}/api/feed?offset=${0}`;

        if (newOptions.channelId) {
          url += `&channelId=${newOptions.channelId}`;
        }
        if (newOptions.cred) {
          url += `&cred=${newOptions.cred}`;
        }

        const result = await fetch(url);
        const data = await result.json();
        setFeed(data.feed);
        setHasNextPage(data.hasNextPage);
        setOptions(newOptions);
      })();
    },
    [feed.length]
  );

  const fetchMore = useCallback(() => {
    (async () => {
      const offset = feed.length;
      let url = `${API_URL}/api/feed?offset=${offset}`;

      if (options.channelId) {
        url += `&channelId=${options.channelId}`;
      }
      if (options.cred) {
        url += `&cred=${options.cred}`;
      }

      const result = await fetch(url);
      const data = await result.json();
      setHasNextPage(data.hasNextPage);
      setFeed([...feed, ...data.feed]);
    })();
  }, [feed.length, options]);

  useEffect(() => {
    if (!hasRunOnce.current) {
      getFeed();
      hasRunOnce.current = true;
    }
  }, [feed.length, getFeed]);

  return { feed, getFeed, fetchMore, hasNextPage };
};

export default useFeed;
