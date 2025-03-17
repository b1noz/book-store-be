const User = require('../models/user');
const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const lodash = require('lodash');
const CloudinaryAdapter = require('../untils/cloudinaryAdapter');

const cloudStorage = new CloudinaryAdapter();

exports.editProfile = async (req, res, next) => {
  try {
    const { userID } = req.user;
    const uploader = async (path) => await cloudStorage.upload(path);
    const data = JSON.parse(req.body.user);
    const user = await User.findById(userID);
    let url = null;
    const files = req.files[0];
    if (files) {
      const { path } = files;
      url = await uploader(path);
      data.image = url;
    }
    if (data.password) {
      bcrypt.hash(data.password, 10, function (err, hash) {
        if (!err) {
          user.password = hash;
          user.save();
        }
      });
      delete data.password;
    }
    const userUpdate = await User.findByIdAndUpdate(userID, { ...data }, { runValidators: true, new: true });
    res.json({
      status: "success",
      user: userUpdate
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { userID } = req.params;
    const uploader = async (path) => await cloudStorage.upload(path);
    const { firstName, lastName, phone, password } = req.body;
    const user = await User.findById(userID);
    let newPass = "";
    let url = null;
    const files = req.files[0];
    if (files) {
      const { path } = files;
      url = await uploader(path);
    }
    if (password) {
      const hashPass = await bcrypt.hash(password, 10);
      newPass = hashPass;
    } else {
      newPass = user.password;
    }

    const userUpdate = await User.findByIdAndUpdate(userID, {
      firstName,
      lastName,
      phone,
      password: newPass,
      image: url || user.image
    }, { new: true });

    if (!userUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ status: 'success', user: userUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changeRoleByAdmin = async (req, res, next) => {
  try {
    const { userID } = req.user;
    const admin = await User.findById(userID);
    if (admin.role === 'admin') {
      const userUpdate = await User.findByIdAndUpdate(req.body.userID, {
        role: req.body.role
      });
      res.json({
        status: 'success',
        userUpdate
      });
    } else {
      res.json({
        status: "failed",
        messenger: "Ban khong phai admin"
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.deleteOneUser = async (req, res, next) => {
  try {
    const { userID } = req.params;
    const user = await User.findByIdAndDelete(userID);

    if (!user) {
      return res.status(404).json({
        status: 'failed',
        message: 'Người dùng không tồn tại'
      });
    }

    // Xóa đánh giá của người dùng khỏi tất cả sản phẩm
    await Product.updateMany(
      { 'review.userID': userID },
      { $pull: { review: { userID: userID } } }
    );

    // Cập nhật lại số sao trung bình của tất cả sản phẩm
    const products = await Product.find({ 'review.userID': userID });
    for (const product of products) {
      const averagedStars = product.review.reduce((t, c) => {
        return t + c.stars;
      }, 0);
      product.averagedStars = averagedStars / product.review.length;
      await product.save();
    }

    res.json({
      status: "success",
      message: 'Người dùng và đánh giá của họ đã được xóa'
    });
  } catch (err) {
    res.json({
      status: 'failed',
      messenger: err
    });
  }
};

exports.getAllUser = async (req, res, next) => {
  try {
    let limit = Math.abs(req.query.limit) || 5;
    let page = (Math.abs(req.query.page) || 1) - 1;
    const users = await User.find({})
      .populate('cart.product')
      .limit(limit)
      .skip(page * limit)
      .sort('role')
      .sort('-createdAt');
    let slUser = await User.find({});
    let totalPage = Math.ceil(slUser.length / limit);
    res.status(200).json({
      status: "success",
      result: users.length,
      users: users,
      totalPage: totalPage
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getOneUser = async (req, res, next) => {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID).populate('cart');
    res.status(200).json({
      status: "success",
      user
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { userID, status } = req.body;
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ status: "failed", messenger: "Người dùng không tìm thấy" });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ status: "success", user });
  } catch (err) {
    console.log("Err", err);
    res.status(500).json({ status: "failed", messenger: "Lỗi server" });
  }
};

exports.addOneProductToCart = async (req, res, next) => {
  try {
    const { userID } = req.user;
    const data = req.body;
    let reqPrice = req.body.price;
    const user = await User.findById(userID)
      .populate("cart.product");
    let index = await lodash._.findIndex(user.cart, (cart) => cart.product === data.product);
    if (index === -1) {
      delete data.price;
      user.cart.push(data);
      user.save(function (err, result) {
        if (err) {
          res.json({
            status: "failed"
          });
          return;
        }
        const subTotal = result.cart.reduce((total, cart, index) => {
          if (index < result.cart.length - 1) {
            let price = cart.product.sale > 0 ? cart.product.price - (cart.product.sale / 100 * cart.product.price) : cart.product.price;
            return total + price * cart.quantity;
          }
          return total + reqPrice * cart.quantity;
        }, 0);
        const idCart = result.cart[result.cart.length - 1]._id;
        res.json({
          status: "success",
          subTotal,
          idCart
        });
      });
    }
  } catch (err) {
    res.json({
      status: "failed",
      err
    });
  }
};

exports.getAllCart = async (req, res) => {
  try {
    const { userID } = req.user;
    const user = await User.findById(userID)
      .populate("cart.product");
    const listCart = user.cart;
    res.json({
      status: "success",
      listCart
    });
  } catch (err) {
    res.json({
      err,
      status: "failed"
    });
  }
};

exports.updateAllCart = async (req, res) => {
  try {
    const { userID } = req.user;
    const { newCart } = req.body;
    const user = await User.findById(userID)
      .populate("cart.product");
    if (user) {
      user.cart = newCart;
      user.save(function (err, result) {
        if (!err) {
          const subTotal = result.cart.reduce((total, cart) => {
            let price = cart.product.sale > 0 ? cart.product.price - (cart.product.sale / 100 * cart.product.price) : cart.product.price;
            return total + price * cart.quantity;
          }, 0);
          res.json({
            status: "success",
            result,
            subTotal
          });
        } else {
          console.log(err);
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.deleteProductToCart = async (req, res, next) => {
  try {
    const { userID } = req.user;
    const { productID } = req.params;
    const user = await User.findById(userID)
      .populate("cart.product");
    let index = await lodash._.findIndex(user.cart, (cart) => cart.product._id == productID);
    if (index !== -1) {
      user.cart.splice(index, 1);
      user.save(function (err, result) {
        if (!err) {
          const subTotal = result.cart.reduce((total, cart) => {
            let price = cart.product.sale > 0 ? cart.product.price - (cart.product.sale / 100 * cart.product.price) : cart.product.price;
            return total + price * cart.quantity;
          }, 0);
          res.json({
            status: "success",
            subTotal
          });
        }
      });
    } else {
      console.log("ERR");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.searchUserByEmail = async (req, res, next) => {
  try {
    const { keyword } = req.body;
    const user = await User.find({
      email: { $regex: keyword, $options: "i" }
    }).limit(5);
    res.json({
      status: "success",
      user
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getTotalUsers = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    res.json({
      status: "success",
      totalUsers
    });
  } catch (err) {
    res.json({
      status: "failed",
      err
    });
  }
};