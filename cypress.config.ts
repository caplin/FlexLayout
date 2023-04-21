import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
    setupNodeEvents(on, config) {},
    viewportWidth: 1024,
    viewportHeight: 768,
    videoCompression: false,
    specPattern: "test/**/*.test.{js,ts,jsx,tsx}",
  }

});
