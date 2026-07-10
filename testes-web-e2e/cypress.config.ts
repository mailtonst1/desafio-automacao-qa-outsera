import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";
import { allureCypress } from "allure-cypress/reporter";
import cypressOnFix from "cypress-on-fix";

export default defineConfig({
  e2e: {
    baseUrl: process.env.AUTOMATION_EXERCISE_URL ?? "https://automationexercise.com",
    specPattern: "cypress/e2e/**/*.feature",
    supportFile: "cypress/support/e2e.ts",
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    screenshotOnRunFailure: true,
    video: true,
    async setupNodeEvents(on, config) {
      on = cypressOnFix(on);
      await addCucumberPreprocessorPlugin(on, config);
      on("file:preprocessor", createBundler({ plugins: [createEsbuildPlugin(config)] }));
      allureCypress(on, config, {
        resultsDir: "allure-results"
      });
      return config;
    }
  }
});
