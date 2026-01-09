import Holiday from "../models/holiday.js";

export const createHoliday = async (data) => {
  const exists = await Holiday.findOne({ date: data.date });
  if (exists) throw new Error("HOLIDAY_ALREADY_EXISTS");

  return await Holiday.create(data);
};

export const getHolidays = async () => {
  return await Holiday.find().sort({ date: 1 });
};

export const deleteHoliday = async (id) => {
  return await Holiday.findByIdAndDelete(id);
};
