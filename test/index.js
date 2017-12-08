
const modules = require.context('./cases', true, /\.js$/);
modules.keys().forEach((item) => {
  modules(item);
});
