import { useState } from 'react';
import {
  GluestackUIProvider,
  HStack,
  Image,
  View,
  Box,
  Text,
  VStack,
  Avatar,
  AvatarImage,
  Button,
  ButtonText,
  ButtonIcon,
  AddIcon,
} from '@gluestack-ui/themed';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { config } from '@gluestack-ui/config'; // Optional if you want to use default theme
import { usePathname } from 'expo-router';
import useFcAccount from '../src/hooks/useFcAccount';
import CredBadge from '../src/components/CredBadge';
import { getSignedInFid, getSignerUuid, trimString } from '../src/utils';
import useCreateSigner from '../src/hooks/useCreateSigner';
import { useEffect } from 'react';

export default function Account() {
  const [fid, setFid] = useState<string | null>();
  const { createSigner } = useCreateSigner();

  const { account } = useFcAccount(fid);
  const fetching = account ? false : true;

  useEffect(() => {
    getSignedInFid().then(_fid => {
      setFid(_fid);
    });
  }, []);

  return (
    <SafeAreaView
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        flex: 1,
      }}
    >
      <GluestackUIProvider config={config}>
        <View>
          {fetching ? (
            <HStack></HStack>
          ) : (
            <VStack px="$5">
              <HStack justifyContent="flex-start" alignItems="center" gap="$2">
                <Box>
                  <Avatar size="md">
                    <AvatarImage source={account.pfp} alt="User avatar" />
                  </Avatar>
                </Box>
                <Box>
                  <HStack alignItems="center" gap="$2">
                    <Text bold size="md">
                      {account.displayName}
                    </Text>
                    <Text size="md" color="$gray">
                      @{account.username}
                    </Text>
                  </HStack>
                </Box>
              </HStack>
              <HStack p="$4" alignItems="center">
                {account.UserCred.map((cred, i) => (
                  <CredBadge credId={cred.cred} key={i}></CredBadge>
                ))}
                <Button size="xs" variant="link" action="primary">
                  <ButtonText>Add</ButtonText>
                  <ButtonIcon as={AddIcon} />
                </Button>
              </HStack>
              <Text>Addresses</Text>
              <VStack>
                {account.addresses.map((address, i) => (
                  <Text key={i}>{trimString(address, 10)}</Text>
                ))}
              </VStack>
            </VStack>
          )}
          <Button
            onPress={() => {
              createSigner();
            }}
          >
            <ButtonText>Sign in</ButtonText>
          </Button>
        </View>
        <StatusBar style="auto" />
      </GluestackUIProvider>
    </SafeAreaView>
  );
}
