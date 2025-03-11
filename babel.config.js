module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@hooks': './src/hooks',
          '@types': './src/types',
          '@utils': './src/utils',
          '@config': './src/config',
          '@assets': './src/assets',
        },
      },
    ],
  ],
  env: {
    test: {
      plugins: ['@babel/plugin-transform-runtime'],
    },
  },
};
