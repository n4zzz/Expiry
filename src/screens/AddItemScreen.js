import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../api/supabase';

export default function AddItemScreen({ navigation }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios'); // iOS stays open, Android closes
    if (selectedDate) setDate(selectedDate);
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    setLoading(true);
    // Format date to YYYY-MM-DD for Supabase
    const formattedDate = date.toISOString().split('T')[0];

    const { error } = await supabase
      .from('items')
      .insert([{ name, expiry_date: formattedDate }]);

    setLoading(true);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Item added!');
      navigation.navigate('Dashboard');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Item Name</Text>
      <TextInput 
        style={styles.input} 
        value={name} 
        onChangeText={setName} 
        placeholder="e.g. Milk" 
      />
      
      <Text style={styles.label}>Expiry Date</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
          minimumDate={new Date()} // Prevent picking past dates
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Button 
          title={loading ? "Saving..." : "Save Item"} 
          onPress={handleSave} 
          disabled={loading} 
          color="#2ecc71" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: '600', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 20 },
  dateButton: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    borderRadius: 8, 
    backgroundColor: '#f9f9f9',
    alignItems: 'center'
  }
});