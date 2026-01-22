import * as HolidayService from "../services/holiday.js";

export const createHoliday = async (req, res) => {
  try {
    const holiday = await HolidayService.createHoliday(req.body);
    res.status(201).json(holiday);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getHolidays = async (req, res) => {
  try {
    const holidays = await HolidayService.getHolidays(req.query.month);
    res.json(holidays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    await HolidayService.deleteHoliday(req.params.id);
    res.json({ message: "Holiday deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
