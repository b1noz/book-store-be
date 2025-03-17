const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
    code: { type: String, require: true },
    discount: { type: Number, require: true, default: 0 },
    //Nếu không cung cấp giá trị cho trường discount khi tạo document mới, giá trị mặc định của nó sẽ là 0
    type: { type: String, require: true },
    expirationDate: { type: Date, required: true }, // Thêm trường expirationDate
    quantity: { type: Number, required: true, default: 1 } // Thêm trường số lượng
}, { timestamps: true });
//timestamps: true tự động thêm createdAt và updatedAt
//timestamps: dấu thời gian đại diện cho 1 giá trị thời gian, nó sẽ tự động thêm 2 trường là createdAt và updatedAt vào trong document   

const Code = mongoose.model('code', codeSchema);

module.exports = Code;