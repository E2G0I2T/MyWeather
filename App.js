import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Fontisto } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";

const API_KEY = "b8d7a4ee38e9775246ab77633daaac35";

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};

export default function App() {
  const [city, setCity] = useState("로딩 중...");
  const [searchCity, setSearchCity] = useState("");
  const [days, setDays] = useState([]);
  const [currentWeather, setCurrentWeather] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      getLocationAndWeather();
    }
  }, [loading, searchCity]);

  // getLocationAndWeather 함수 내부 수정
  const getLocationAndWeather = async (cityName = "") => {
    try {

      if (!cityName) {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.error("위치 액세스 권한이 거부되었습니다");
          return;
        }

        location = await Location.getCurrentPositionAsync({});
      }

      const latitude = location?.coords?.latitude || 0;
      const longitude = location?.coords?.longitude || 0;

      // 현재 날씨 정보를 가져오는 부분 추가
      const currentWeatherResponse = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      );
      const currentWeatherData = await currentWeatherResponse.json();
      console.log("Current Weather Response:", currentWeatherData);

      if (!cityName) {
        // 검색하지 않은 경우에만 현재 위치 정보로 업데이트
        setCity(currentWeatherData.name);
        setCurrentWeather(currentWeatherData);
      }

      if (cityName) {
        // 검색한 경우에는 검색한 도시의 정보로 업데이트
        const searchResponse = await fetch(
          `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`
        );
        const searchWeatherData = await searchResponse.json();
        console.log("Search Weather Response:", searchWeatherData);

        setCity(searchWeatherData.name);
        setCurrentWeather(searchWeatherData);
      }

      // 5일 날씨 예보 정보를 가져오는 부분 추가
      const forecastResponse = await fetch(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      );
      const forecastData = await forecastResponse.json();

      setDays(forecastData.list);
      setLoading(false);
    } catch (error) {
      console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
      setLoading(false);
      return; 
    }
  };

  const handleDayPress = (day) => {
    console.log("Selected day:", day);
  };

  const handleSearch = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}`
      );
      const currentWeatherData = await response.json();

      console.log("Search Weather Response:", currentWeatherData);

      setCurrentWeather(currentWeatherData);
      // 서버 응답에서 도시 이름 가져오기
      setCity(currentWeatherData.name);

      getLocationAndWeather(searchCity);
    } catch (error) {
      console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#56CCF2", "#2F80ED"]} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="도시를 검색하세요"
          placeholderTextColor="white"
          onChangeText={(text) => setSearchCity(text)}
          value={searchCity}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>검색</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.currentWeather}>
        <Text style={styles.cityName}>{city}</Text>
        <Text style={styles.currentTemp}>
          {currentWeather.main && (
            <>{parseFloat(currentWeather.main.temp - 273.15).toFixed(1)}°C</>
          )}
        </Text>
        <View style={styles.currentWeatherDetails}>
          <Text style={styles.currentWeatherText}>
            {currentWeather.weather && currentWeather.weather[0].main}
          </Text>
          <Text style={styles.currentDescriptionText}>
            {currentWeather.weather && currentWeather.weather[0].description}
          </Text>
        </View>
        <View style={styles.currentIconContainer}>
          <Fontisto
            name={
              currentWeather.weather && icons[currentWeather.weather[0].main]
            }
            size={68}
            color="white"
          />
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.daysContainer}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : (
          days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={styles.day}
              onPress={() => handleDayPress(day)}
            >
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>
                  {new Date(day.dt_txt).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.timeText}>
                  {new Date(day.dt_txt).toLocaleTimeString("ko-KR", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Text style={styles.temp}>
                {parseFloat(day.main.temp - 273.15).toFixed(1)}°C
              </Text>
              <View style={styles.iconContainer}>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={68}
                  color="white"
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    color: "white",
  },
  searchButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "white",
  },
  currentWeather: {
    alignItems: "center",
    marginBottom: 20,
  },
  cityName: {
    color: "white",
  },
  currentTemp: {
    fontSize: 40,
    fontWeight: "600",
    color: "white",
  },
  currentWeatherDetails: {
    alignItems: "center",
    marginVertical: 10,
  },
  currentWeatherText: {
    fontSize: 18,
    color: "white",
  },
  currentDescriptionText: {
    fontSize: 14,
    color: "white",
  },
  currentIconContainer: {
    backgroundColor: "rgba(0, 0, 0, 0)",
    padding: 10,
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  daysContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  day: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    alignItems: "flex-start",
  },
  dateText: {
    fontSize: 16,
    color: "white",
  },
  timeText: {
    fontSize: 16,
    color: "white",
  },
  temp: {
    fontWeight: "600",
    fontSize: 40,
    color: "white",
  },
  iconContainer: {
    backgroundColor: "rgba(0, 0, 0, 0)",
    padding: 10,
    borderRadius: 10,
  },
});
