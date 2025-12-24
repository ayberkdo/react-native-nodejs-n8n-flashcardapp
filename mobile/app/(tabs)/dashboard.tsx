// app/(tabs)/dashboard.tsx

import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../_layout';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const router = useRouter();

  const handleChangeLanguage = async () => {
    await setSelectedLanguage(null);
    
    router.replace('/(onboarding)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hoşgeldin Ayberk</Text>

        <TouchableOpacity style={styles.headerButton} onPress={handleChangeLanguage}>
          <Text style={styles.headerButtonText}>Dili Değiştir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <Text style={styles.mainLabel}>Seçilen Dil</Text>
        <Text style={styles.mainLanguage}>
          {selectedLanguage ? selectedLanguage.name : 'Dil Seçilmedi'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7de',
    backgroundColor: '#ffffff',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292f',
  },

  headerButton: {
    backgroundColor: '#2da44e',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(27,31,36,0.15)',
  },

  headerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainLabel: {
    fontSize: 14,
    color: '#57606a',
  },

  mainLanguage: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0969da',
    marginTop: 6,
  },
});
