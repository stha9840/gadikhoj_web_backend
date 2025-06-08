const mongoose = require("mongoose")

const CONNECTION_STRING = process.env.MONGODB_URL

const connectDB = async()=>{
    try{
        await mongoose.connect(
            CONNECTION_STRING,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )
        console.log("Mongodb Connected");
    }catch(err){
        console.log("DB error", err);
    }
}
module.exports = connectDB