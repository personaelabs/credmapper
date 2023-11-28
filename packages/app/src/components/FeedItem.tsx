import { useState } from 'react';
import { FeedItemData } from '../types';
import {
  Avatar,
  View,
  Text,
  Box,
  HStack,
  AvatarImage,
  VStack,
  Icon,
  RepeatIcon,
  FavouriteIcon,
  Pressable,
} from '@gluestack-ui/themed';
import { formatDistanceToNow } from 'date-fns';
import CRED_META from '../credMeta';
import { trimString } from '../utils';
import Hyperlink from 'react-native-hyperlink';
import ImageViewer from 'react-native-image-zoom-viewer';
import { ImageBackground, Modal } from 'react-native';
import { Image } from 'expo-image';

type FeedItemProps = FeedItemData;

interface BadgeProps {
  name: string;
  image: string;
  color: string;
  bgColor: string;
  alt: string;
}
const Badge = (props: BadgeProps) => {
  return (
    <View flexWrap="wrap">
      <HStack
        px="$2"
        py="$0.5"
        alignItems="center"
        justifyContent="flex-start"
        bgColor={props.bgColor}
        gap="$2"
      >
        <View w="$4" h="$4">
          <Image source={{ uri: props.image }} alt={props.alt}></Image>
        </View>
        <Text color={props.color}>{props.name}</Text>
      </HStack>
    </View>
  );
};

const FeedItem = (props: FeedItemProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const time = formatDistanceToNow(new Date(props.timestamp));

  const images = props.embeds
    .filter(embed => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(embed))
    .map(embed => ({ url: embed }));

  return (
    <HStack p="$5" justifyContent="flex-start" alignItems="flex-start">
      <Box w="$1/6">
        <Avatar size="md">
          <AvatarImage source={props.user.pfp} alt="User avatar" />
        </Avatar>
      </Box>
      <Box w="$5/6">
        <VStack>
          <HStack alignItems="center" gap="$2">
            <Text bold size="md">
              {trimString(props.user.displayName, 13)}
            </Text>
            <Text size="md" color="$gray">
              @{trimString(props.user.username, 13)}
            </Text>
            <Text color="$gray">{time}</Text>
          </HStack>
          <View mt="$2">
            <Hyperlink
              linkDefault={true}
              linkStyle={{
                color: '#0284C7',
              }}
            >
              <Text size="md" selectable={true}>
                {props.text}
              </Text>
            </Hyperlink>
            <View alignItems="center" mt="$1">
              {images.map((embed, i) => (
                <Pressable
                  mt="$2"
                  key={i}
                  onPress={() => {
                    setSelectedImage(i);
                  }}
                >
                  <Image source={{ uri: embed.url }} alt={'image' + i}></Image>
                </Pressable>
              ))}
            </View>
          </View>
          <Box mt="$4" gap="$2">
            {props.channel ? (
              <Badge
                name={props.channel.name}
                image={props.channel.image}
                color="#EA580C"
                bgColor="#FFF4EB"
                alt="Channel icon"
              />
            ) : (
              <></>
            )}
            <HStack flexWrap="wrap" gap="$2">
              {props.user.UserCred.map(({ cred: credId }, i) => {
                const cred = CRED_META[credId];
                return (
                  <Badge
                    key={i}
                    name={cred.name}
                    image={cred.image}
                    color="#0284C7"
                    bgColor="#EBF8FE"
                    alt="Cred icon"
                  />
                );
              })}
            </HStack>
          </Box>
          <HStack justifyContent="flex-end" px="$6" gap="$2">
            <HStack alignItems="center">
              <Icon as={RepeatIcon} size="md" color="$gray"></Icon>
              <Text size="md" color="$gray" ml="$1">
                {props.recastsCount}
              </Text>
            </HStack>
            <HStack alignItems="center">
              <Icon as={FavouriteIcon} size="md" color="$gray"></Icon>
              <Text size="md" color="$gray" ml="$1">
                {props.likesCount}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
      <Modal visible={selectedImage !== null} transparent={true}>
        {selectedImage !== null ? (
          <ImageViewer
            enableSwipeDown={true}
            swipeDownThreshold={20}
            imageUrls={images}
            onClick={() => {
              setSelectedImage(null);
            }}
            onCancel={() => {
              setSelectedImage(null);
            }}
            index={selectedImage}
          />
        ) : (
          <> </>
        )}
      </Modal>
    </HStack>
  );
};

export default FeedItem;
