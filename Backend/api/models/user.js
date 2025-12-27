import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String, require:true},
    loginId:{type:String, require:true, unique:true,trim: true,},
    password:{type:String, require:true},
    role:{type:String, require:true, enum:["employee","student", "admin", "superAdmin"]},
})

export default mongoose.model("user", userSchema);
