const required = (val, name) => {
  if (val) return val;
  console.error(`${name} required`);
  return process.exit(1);
};

export default required;
