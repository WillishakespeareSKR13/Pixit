// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: false
// });

module.exports = {
  env: {
    KEYSENDGRID: process.env.KEYSENDGRID
  },
  images: {
    loader: 'imgix',
    path: '/'
  }
};
