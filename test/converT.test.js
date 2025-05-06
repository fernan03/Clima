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