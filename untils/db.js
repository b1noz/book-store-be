const mongoose = require('mongoose');

let connection = null; // Sử dụng biến cục bộ để lưu trữ kết nối

class MongoDBSingleton {
  constructor() {
    if (!MongoDBSingleton.instance) {
      MongoDBSingleton.instance = this;
    }

    return MongoDBSingleton.instance;
  }

  async connect() {
    if (connection) {
      return connection;
    }

    try {
      connection = await mongoose.connect(process.env.DB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
      });
      console.log('DB connect successfully');
      return connection;
    } catch (err) {
      console.log(err);
      console.log('DB connect failed');
      process.exit(1);
    }
  }
}

const instance = new MongoDBSingleton();
Object.freeze(instance);

module.exports = instance;