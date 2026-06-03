import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'Nutritalk_ai' });
  } catch {
    process.exit(1);
  }
};

export default connectDB;
