// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  use: {
    baseURL: 'https://lejonmanen.github.io/timer-vue/',
    headless: true
  }
});
