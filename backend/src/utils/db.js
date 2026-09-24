
import mongoose from "mongoose"

const connectDB = async()=>{
try
{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Mongogodb connected')

}catch(error){
  console.error("Mongodb connection failed", error);
  //program ended with error
  process.exit(1);
}
}
export default connectDB;