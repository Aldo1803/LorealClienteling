let startTime = Date.now();

const getUptime = () => {
  return Date.now() - startTime;
};

module.exports = {
  getUptime
}; 