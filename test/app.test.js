import test from 'node:test';
import {convertTemperature} from '../App/api.js';

test('convierte Celsius a fahrenheit', () => {
    expect(convertTemperature(0, true)).toBe(32);
});

test('convierte fahrenheit a Celsius', () => {
    expect(Math.round(convertTemperature(32, false))).toBe(0);
});