import mongoose from "mongoose";

console.log("URI =", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("✅ MongoDB CONNECTED");
  process.exit(0);
})
.catch(err => {
  console.error("❌ MongoDB FAILED");
  console.error(err);
  process.exit(1);
});
