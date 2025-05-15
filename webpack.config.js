const path = require('path');

module.exports = {
  entry: '/src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/', // <-- important pour dev-server
    clean: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public') // <-- sert les fichiers HTML
    },
    port: 3000,
    open: true,
    hot: true,
  },
  mode: 'development',
   module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ],
  }
  
};
