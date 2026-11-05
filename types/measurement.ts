/** Mesure publiée par un ESP32 sur le broker MQTT. */
export type Measurement = {
  zoneId: string;
  timestamp: string;
  temperature?: number;
  humidity?: number;
  /** Courant efficace mesuré par l'ACS712, en ampères. */
  current?: number;
  /** Niveau de CO2 / gaz (MQ135), en ppm. */
  co2?: number;
  /** Luminosité (BH1750), en lux. */
  lux?: number;
  presence?: boolean;
};
