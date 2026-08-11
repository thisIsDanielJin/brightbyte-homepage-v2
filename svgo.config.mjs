export default {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeUnknownsAndDefaults: {
            keepRoleAttr: true,
          },
          convertColors: false,
        }
      }
    }
  ]
};
