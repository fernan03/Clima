const { test, expect } = require('@jest/globals');
const {convertTemperature}=require('../App/api.js');

test('convierte Celsius a Fahrenheit', () => {
  expect(convertTemperature(0, true)).toBe(32);
});

test('convierte Fahrenheit a Celsius', () => {
  expect(convertTemperature(32, false)).toBe(0);
});