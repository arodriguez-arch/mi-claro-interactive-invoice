import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'mi-claro-interactive-invoice',
  globalStyle: 'src/global/app.css',
  outputTargets: [
    // Core distribution - standard web components
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [
        { src: '../assets', dest: 'assets' }
      ]
    },
    // Custom elements bundle - for tree-shaking
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
      copy: [
        { src: '../assets', dest: 'assets' }
      ]
    },
    // Documentation
    {
      type: 'docs-readme',
    },
    // Development server
    {
      type: 'www',
      serviceWorker: null,
      copy: [
        { src: '../assets', dest: 'assets' }
      ]
    },
    // JSON documentation for tooling
    {
      type: 'docs-json',
      file: 'dist/docs.json'
    }
  ],
  testing: {
    browserHeadless: "shell",
  },
};
