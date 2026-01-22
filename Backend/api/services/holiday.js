import Holiday from "../models/holiday.js";
import Attendance from "../models/attendance.js";
import { eachDayOfInterval, startOfDay } from "date-fns";

export const createHoliday = async (data) => {
  const {
    startDate,
    endDate,
    title,
    description,
    type,
    appliesToAllClasses = true,
    classIds = [],
  } = data;

  const dateFrom = startOfDay(new Date(startDate));
  const dateTo = startOfDay(new Date(endDate));

  /* ===============================
     🔹 VALIDATION
  =============================== */
  if (dateTo < dateFrom) {
    throw new Error("INVALID_DATE_RANGE");
  }

  /* ===============================
     🔹 CHECK OVERLAP
  =============================== */
  const existing = await Holiday.findOne({
    $and: [
      { dateFrom: { $lte: dateTo } },
      { dateTo: { $gte: dateFrom } },
      appliesToAllClasses ? {} : { classIds: { $in: classIds } },
    ],
  });

  if (existing) {
    throw new Error("HOLIDAY_ALREADY_EXISTS");
  }

  /* ===============================
     🔹 CREATE HOLIDAY
  =============================== */
  const holiday = await Holiday.create({
    dateFrom,
    dateTo,
    title,
    description,
    type,
    appliesToAllClasses,
    classIds: appliesToAllClasses ? [] : classIds,
  });

  /* ===============================
     🔹 UPDATE ATTENDANCE
  =============================== */
  const dates = eachDayOfInterval({
    start: dateFrom,
    end: dateTo,
  });

  const attendanceQuery = {
    date: { $in: dates },
  };

  if (!appliesToAllClasses) {
    attendanceQuery.classId = { $in: classIds };
  }

  await Attendance.updateMany(attendanceQuery, {
    $set: {
      isHoliday: true,
      holidayReason: title,
      takenBy: null,
      students: [],
    },
  });

  return holiday;
};


export const getHolidays = async ({ month }) => {
  /**
   * month format: YYYY-MM
   * example: 2026-01
   */
  let query = {};

  if (month) {
    const [year, mon] = month.split("-");
    const monthStart = new Date(year, mon - 1, 1, 0, 0, 0);
    const monthEnd = new Date(year, mon, 0, 23, 59, 59);

    query = {
      $and: [
        { dateFrom: { $lte: monthEnd } },
        { dateTo: { $gte: monthStart } },
      ],
    };
  }

  return await Holiday.find(query).sort({ dateFrom: 1 });
};

export const deleteHoliday = async (id) => {
  return await Holiday.findByIdAndDelete(id);
};
