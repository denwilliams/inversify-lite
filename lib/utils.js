exports.dashToCamel = (str) => {
  return str.replace(/\-([a-z])/g, (m, a) => {
    return a.toUpperCase();
  });
};
