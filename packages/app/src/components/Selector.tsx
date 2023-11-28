import { useState } from 'react';
import {
  Text,
  View,
  Select,
  SelectItem,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectContent,
  Icon,
  ChevronDownIcon,
  SelectBackdrop,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  Pressable,
} from '@gluestack-ui/themed';
import { Image } from 'expo-image';
import SearchModal from './SearchModal';

interface SelectorOption {
  label: string;
  value: string;
  image?: string;
}

interface SelectorProps {
  placeholder: string;
  options: SelectorOption[];
  value: string | null;
  onValueChange: (value: string) => void;
}

const Selector = (props: SelectorProps) => {
  const { options, value, onValueChange, placeholder } = props;

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <>
      <Select>
        <SelectTrigger
          variant="rounded"
          size="lg"
          onPress={() => {
            setSearchModalOpen(true);
          }}
          px="$3"
          alignItems="center"
          justifyContent="center"
        >
          <SelectIcon mb="$1">
            <Image
              source={{
                uri: options.find(option => option.value === value)?.image,
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
              }}
              alt="Selector icon"
            ></Image>
          </SelectIcon>
          <Pressable>
            <View>
              <SelectInput
                value={
                  options.find(option => option.value === value)?.label || ''
                }
                placeholder={placeholder}
              />
            </View>
          </Pressable>
          <SelectIcon mr="$3">
            <Icon as={ChevronDownIcon} />
          </SelectIcon>
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {options.map(option => (
              <SelectItem
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
      <SearchModal
        title={props.placeholder}
        options={options}
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelect={value => {
          onValueChange(value);
        }}
      />
    </>
  );
};

export default Selector;
