module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.node'],
        alias: {
          '@screens': './src/screens',
          '@components': './src/components',
          '@services': './src/services',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@context': './src/context',
          '@assets': './assets',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
