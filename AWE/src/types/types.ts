export type Accident = {
  id: string;
  source: string;
  severity: string;
  start_time: string;
  end_time: string;
  duration: string;
  end_lat: string;
  end_lng: string;
  start_lat: string;
  start_lng: string;
  description: string;
  distance_mi: string;
  amenity?: boolean;
  bump?: boolean;
  crossing?: boolean;
  give_way?: boolean;
  junction?: boolean;
  no_exit?: boolean;
  railway?: boolean;
  roundabout?: boolean;
  station?: boolean;
  stop?: boolean;
  traffic_calming?: boolean;
  traffic_signal?: boolean;
  turning_loop?: boolean;
  [key: string]: any;
};

export type DurationFilter = "short" | "medium" | "long" | "all";
export type DistanceFilter = "short" | "medium" | "long" | "all";
export type WeatherFilter = "clear" | "rain" | "snow" | "fog" | "cloudy" | "all";
export type TimeOfDayFilter = "morning" | "afternoon" | "evening" | "night" | "all";
export type DayOfWeekFilter = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" | "weekday" | "weekend" | "all";

export interface FilterState {
  duration: DurationFilter;
  distance: DistanceFilter;
  weather: WeatherFilter;
  timeOfDay: TimeOfDayFilter;
  dayOfWeek: DayOfWeekFilter;
}
