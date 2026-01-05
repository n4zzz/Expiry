import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from './src/api/supabase';
import { Home, PlusCircle, ShoppingBag } from 'lucide-react-native';
import DashboardScreen from './src/screens/DashboardScreen';
import AddItemScreen from './src/screens/AddItemScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <NavigationContainer>
      {session ? (
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#2ecc71' }}>
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
          />
          <Tab.Screen 
            name="Add Item" 
            component={AddItemScreen} 
            options={{ tabBarIcon: ({ color }) => <PlusCircle color={color} size={24} /> }}
          />
        </Tab.Navigator>
      ) : (
        <DashboardScreen /> 
      )}
    </NavigationContainer>
  );
}