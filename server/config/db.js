const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const connection = monngoose.connect("http://localhost:2173/FeesAndAttendanceDB")
        if(connection.readyState === 1){ 
            console.log("Connected to MongoDB");
        }
    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
    }
}

exports.connectDB = connectDB;