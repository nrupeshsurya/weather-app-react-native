import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import WeatherInfo from './components/WeatherInfo';
import UnitPicker from './components/UnitPicker';
import { colors } from './utils/index';
import ReloadIcon from './components/ReloadIcon';
import WeatherDetails from './components/WeatherDetails';

const {PRIMARY_COLOR} = colors;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?';

export default function App() {

  const [errorMessage,setErrorMessage] = useState(null); 
  const [currentWeather, setCurrentWeather] = useState(null);
  const [unitSystem, setUnitSystem] = useState('metric');

  useEffect(() => {
    load()
  }, [unitSystem])

  async function load() {
    setCurrentWeather(null);
    setErrorMessage(null);
    try {

      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMessage('Access needs to be granted!');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Lowest});
      const {latitude, longitude} = location.coords;
      
      const weatherURL = `${BASE_WEATHER_URL}lat=${latitude}&lon=${longitude}&units=${unitSystem}&appid=${WEATHER_API_KEY}`;
      const response = await fetch(weatherURL);
      const result = await response.json();
      if (response.ok) {
        setCurrentWeather(result);
      } else {
        setErrorMessage(result.message);
      }
      // alert(`Latitude : ${latitude}, Longitude : ${longitude}`);

    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (currentWeather) {    
    // const { main : {temp}} = currentWeather;
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style = {styles.main}>
          {/* <Text>The current temperature is : {temp}</Text> */}
          <UnitPicker unitSystem={unitSystem} setUnitSystem={setUnitSystem}/>
          <ReloadIcon load={load} />
          <WeatherInfo currentWeather={currentWeather} />
        </View>
        <WeatherDetails currentWeather={currentWeather} unitSystem={unitSystem} />
      </View>
    );
  } else if (errorMessage) {
    return (
      <View style={styles.container}>
        <ReloadIcon />
        <Text style = {{textAlign: 'center'}}>{errorMessage}</Text>
        <StatusBar style="auto" />
      </View>
    );
  } else {
    return (
    <View style={styles.container}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <StatusBar style="auto" />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  main : {
    justifyContent: 'center',
    flex: 1,
  }
});
