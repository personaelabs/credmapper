import { View, Text, HStack } from '@gluestack-ui/themed';
import CRED_META from '../credMeta';
import { Image } from 'expo-image';

interface CredBadgeProps {
  credId: string;
}

const CredBadge = (props: CredBadgeProps) => {
  const cred = CRED_META[props.credId];
  return (
    <View flexWrap="wrap">
      <HStack
        px="$2"
        py="$0.5"
        alignItems="center"
        justifyContent="flex-start"
        gap="$2"
        bgColor="#EBF8FE"
      >
        <View w="$4" h="$4">
          <Image
            source={{
              uri: cred.image,
            }}
            alt="cred icon"
          ></Image>
        </View>
        <Text color="#0284C7">{cred.name}</Text>
      </HStack>
    </View>
  );
};

export default CredBadge;
