import { useEffect, useState } from 'react';
import { GluestackUIProvider, Divider, View, Box } from '@gluestack-ui/themed';
import Selector from '../src/components/Selector';
import { StatusBar } from 'expo-status-bar';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native';
import FeedItem from '../src/components/FeedItem';
import useFeed from '../src/hooks/useFeed';
import { config } from '@gluestack-ui/config';
import channels from '../channels.json';
import useScroll from '../src/hooks/useScroll';
import CRED_META from '../src/credMeta';

const CHANNEL_OPTIONS = [
  {
    label: 'All',
    value: null,
  },
  ...channels.map((channel) => ({
    label: channel.name,
    value: channel.channel_id,
    image: channel.image,
  })),
];

const CRED_OPTIONS = [
  {
    label: 'All',
    value: null,
  },
  ...Object.values(CRED_META).map((cred) => ({
    label: cred.name,
    value: cred.id,
    image: cred.image,
  })),
];

export default function App() {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const { feed, fetchMore, getFeed, hasNextPage } = useFeed();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedCred, setSelectedCred] = useState<string | null>(null);
  const { handleScroll, scrollDirection } = useScroll();

  useEffect(() => {
    if (selectedChannel === null && selectedCred === null) {
      getFeed();
    } else {
      getFeed({
        channelId: selectedChannel,
        cred: selectedCred,
      });
    }
  }, [selectedChannel, selectedCred]);

  const headerVisible = scrollDirection === 'down' ? true : false;

  return (
    <SafeAreaView
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        flex: 1,
      }}
    >
      <GluestackUIProvider config={config}>
        <Box
          alignItems="center"
          pt="$10"
          pb="$10"
          gap={20}
          display={headerVisible ? 'flex' : 'none'}
          position="absolute"
          justifyContent="center"
          right={0}
          left={0}
          height={160}
          zIndex={100000}
          backgroundColor="white"
        >
          <Selector
            placeholder="Select a channel"
            options={CHANNEL_OPTIONS}
            value={selectedChannel}
            onValueChange={setSelectedChannel}
          ></Selector>
          <Selector
            placeholder="Select a cred"
            options={CRED_OPTIONS}
            value={selectedCred}
            onValueChange={setSelectedCred}
          ></Selector>
        </Box>
        <FlashList
          onScroll={handleScroll}
          scrollEventThrottle={16}
          data={feed}
          contentContainerStyle={{ paddingTop: 160 }}
          renderItem={({ item }) => (
            <>
              <FeedItem {...item}></FeedItem>
              <Divider></Divider>
            </>
          )}
          estimatedItemSize={350}
          onEndReached={() => {
            if (hasNextPage) {
              fetchMore();
            }
          }}
          onEndReachedThreshold={0.5}
        />
        <StatusBar style="auto" />
      </GluestackUIProvider>
    </SafeAreaView>
  );
}
