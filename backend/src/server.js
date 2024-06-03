import app from "./app.js";
import dbConnect from "./db/db.js";

const port = process.env.PORT || 3000;

dbConnect()
  .then(() => {
    app.on("error", (err) => {
      console.log(`Error: ${err.message}`);
      throw err;
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(`Error in connecting to MongoDB. Error: ${err.message}`);
  });
