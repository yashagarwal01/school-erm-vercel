import Counter from "../models/counter.js";

export const generateId = async (prefix) => {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`; // internal only

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(6, "0");

  // ✅ No hyphen in final ID
  return `${prefix}${year}${paddedSeq}`;
};
