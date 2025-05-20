const { test, expect } = require('@jest/globals');

function convertTemperature(celsius, toFahrenheit ){
    return toFahrenheit ? (celsius * 9)/ 5 + 32 : ((celsius - 32) * 5) / 9;
}

test('convierte Celsius a Fahrenheit', () => {
  expect(convertTemperature(0, true)).toBe(32);
});

test('convierte Fahrenheit a Celsius', () => {
  expect(convertTemperature(32, false)).toBe(0);
});

test('32°F a Celsius debe ser 0°C', () => {
  expect(convertTemperature(32, false)).toBe(0);
});

test('212°F a Celsius debe ser 100°C', () => {
  expect(convertTemperature(212, false)).toBe(100);
});