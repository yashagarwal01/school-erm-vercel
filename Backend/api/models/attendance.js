import mongoose from "mongoose";

const attendanceStudentSchema = new mongoose.Schema(
    {
        studentUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },

        rollNumber: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: ["present", "absent", "leave","holiday"],
            required: true,
            default: "holiday",
        },
    },
    { _id: false }
);

const attendanceSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        isHoliday: {
            type: Boolean,
            default: false,
        },

        holidayReason: {
            type: String,
            trim: true,
        },
        takenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user", // class teacher / admin
            // required: true,
        },

        students: {
            type: [attendanceStudentSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

/**
 * 🚫 Prevent duplicate attendance for same class + same day
 */
attendanceSchema.index({ classId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
