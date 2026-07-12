import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Relatorio unificado Outsera',
  output: './saida',
  plugins: {
    awesome: {
      options: {
        singleFile: true,
        reportLanguage: 'br',
      },
    },
  },
});
