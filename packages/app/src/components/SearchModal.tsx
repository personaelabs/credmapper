import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  Heading,
  ModalCloseButton,
  Box,
  CloseIcon,
  ModalBody,
  Text,
  View,
  ButtonText,
  Button,
  ModalFooter,
  Icon,
  VStack,
  Input,
  InputField,
  HStack,
  Divider,
  ScrollView,
  Pressable,
} from '@gluestack-ui/themed';
import { FlashList } from '@shopify/flash-list';
import { useRef, useState } from 'react';
import channels from '../../channels.json';
import { Image } from 'expo-image';

interface CredItemProps {
  name: string;
  image?: string;
}

const CredItem = (props: CredItemProps) => {
  return (
    <HStack gap="$2" alignItems="center">
      <View w="$8" h="$8">
        <Image source={{ uri: props.image }} alt={props.name} />
      </View>
      <Text>{props.name}</Text>
    </HStack>
  );
};

interface SearchModalProps {
  title: string;
  open: boolean;
  options: { label: string; image?: string; value: string }[];
  onClose: () => void;
  onSelect: (value: string) => void;
}

const SearchModal = (props: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const options = props.options.filter(option =>
    option.label.toLowerCase().includes(query.toLowerCase())
  );

  const onClose = () => {
    setQuery('');
    props.onClose();
  };

  return (
    <Modal isOpen={props.open} onClose={onClose} finalFocusRef={ref} pt="$40">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{props.title}</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <VStack gap="$2">
            <Input variant="outline" size="md">
              <InputField
                placeholder="Search"
                onChange={value => {
                  setQuery(value.nativeEvent.text);
                }}
              />
            </Input>
            <ScrollView h="$80">
              {options.map((option, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    props.onSelect(option.value);
                    onClose();
                  }}
                >
                  <VStack justifyContent="center">
                    <CredItem
                      key={i}
                      name={option.label}
                      image={option.image}
                    />
                    <Divider mt="$2" mb="$2"></Divider>
                  </VStack>
                </Pressable>
              ))}
            </ScrollView>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            action="secondary"
            mr="$3"
            onPress={onClose}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SearchModal;
