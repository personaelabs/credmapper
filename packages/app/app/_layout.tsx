import { Tabs } from 'expo-router/tabs';
import { Slot } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';

const HomeIcon = () => <AntDesign name="home" size={24} color="black" />;
const AccountIcon = () => <AntDesign name="user" size={24} color="black" />;

export default function HomeLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: HomeIcon,
          tabBarLabelStyle: {
            fontSize: 12,
            color: 'black',
          },
          // This tab will no longer show up in the tab bar.
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          headerTitle: 'Account',
          tabBarLabel: 'Account',
          tabBarIcon: AccountIcon,
          tabBarLabelStyle: {
            fontSize: 12,
            color: 'black',
          },
          tabBarBadgeStyle: {
            backgroundColor: 'red',
          },
          // This tab will no longer show up in the tab bar.
        }}
      />
    </Tabs>
  );
}
