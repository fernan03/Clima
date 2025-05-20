const { test, expect } = require('@jest/globals');

// Reemplazamos la implementación de fetch en cada prueba
let fetchMock;

// Simulamos la función como si fuera en api.js
async function getUVIndex(lat, lon) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=fake-key`);
  if (!response.ok) throw new Error('No se pudo obtener el índice UV');
  const data = await response.json();
  return data.value;
}

// --- PRUEBA 1: respuesta exitosa ---
test('devuelve el índice UV correctamente', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ value: 7.5 })
    })
  );

  const uv = await getUVIndex(6.25, -75.56);
  expect(uv).toBe(7.5);
});

// --- PRUEBA 2: respuesta fallida (API devuelve ok: false) ---
test('lanza error si la respuesta no es ok', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status: 404
    })
  );

  await expect(getUVIndex(0, 0)).rejects.toThrow('No se pudo obtener el índice UV');
});

