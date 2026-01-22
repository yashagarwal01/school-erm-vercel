export const getISTDayStart = (dateInput = new Date()) => {
  const date = new Date(dateInput);

  // Convert to IST
  const istOffset = 5.5 * 60; // minutes
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + istOffset * 60000);

  // Set IST midnight
  istTime.setHours(0, 0, 0, 0);

  return istTime;
};
