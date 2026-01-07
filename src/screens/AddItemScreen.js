import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../api/supabase';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';

const CATEGORIES = ['Food', 'Medicine', 'Beauty', 'Household'];
const FOOD_SUB = ['Pantry', 'Fridge', 'Freezer'];

export default function AddItemScreen({ navigation }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [subCategory, setSubCategory] = useState('Pantry');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to take photos.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required to pick a photo.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!name || !location) {
      Alert.alert('Error', 'Please enter a name and location');
      return;
    }

    setLoading(true);
    let publicUrl = null;

    if (image) {
      try {
        const fileName = `${Date.now()}.jpg`;

        const base64 = await FileSystem.readAsStringAsync(image, {
          encoding: 'base64',
        });

        const { error: uploadError } = await supabase.storage
          .from('location-images')
          .upload(fileName, decode(base64), {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Upload Error', uploadError.message);
        } else {
          const { data: urlData } = supabase.storage.from('location-images').getPublicUrl(fileName);
          publicUrl = urlData.publicUrl;
          console.log('Image uploaded successfully:', publicUrl);
        }
      } catch (uploadErr) {
        console.error('Image upload failed:', uploadErr);
        Alert.alert('Upload Error', 'Failed to upload image. Item will be saved without photo.');
      }
    }

    const finalCategory = category === 'Food' ? `Food (${subCategory})` : category;

    const { error } = await supabase
      .from('items')
      .insert([{
        name,
        category: finalCategory,
        location,
        image_url: publicUrl,
        expiry_date: date.toISOString().split('T')[0]
      }]);

    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Item added!');
      navigation.navigate('Dashboard');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Item Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Milk" />

      <Text style={styles.label}>Category</Text>
      <View style={styles.row}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.activeChip]} onPress={() => setCategory(cat)}>
            <Text style={category === cat ? styles.activeText : styles.text}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {category === 'Food' && (
        <View style={styles.row}>
          {FOOD_SUB.map(sub => (
            <TouchableOpacity key={sub} style={[styles.subChip, subCategory === sub && styles.activeSub]} onPress={() => setSubCategory(sub)}>
              <Text style={subCategory === sub ? styles.activeText : styles.text}>{sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>Location Details</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Fridge Bottom Shelf" />

      <Text style={styles.label}>Expiry Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowPicker(false); if (d) setDate(d); }} />
      )}

      <Text style={styles.label}>Location Photo</Text>
      <View style={styles.imageSection}>
        {image ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: image }} style={styles.fullImg} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
              <Camera color="#2ecc71" size={24} />
              <Text style={styles.actionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
              <ImageIcon color="#2ecc71" size={24} />
              <Text style={styles.actionText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Button title={loading ? "Saving..." : "Save Item"} onPress={handleSave} color="#2ecc71" disabled={loading} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { padding: 8, borderWidth: 1, borderColor: '#2ecc71', borderRadius: 20, marginRight: 8, marginBottom: 8 },
  activeChip: { backgroundColor: '#2ecc71' },
  subChip: { padding: 6, borderWidth: 1, borderColor: '#999', borderRadius: 20, marginRight: 8 },
  activeSub: { backgroundColor: '#999' },
  text: { color: '#2ecc71' },
  activeText: { color: '#fff' },
  imageSection: { marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f9f9f9', padding: 20, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  actionButton: { alignItems: 'center' },
  actionText: { color: '#2ecc71', marginTop: 5, fontSize: 12 },
  imageWrapper: { height: 200, width: '100%', position: 'relative' },
  fullImg: { width: '100%', height: '100%', borderRadius: 10 },
  removeBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
});