var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');

var products = [
    new Product({
        imagePath: 'https://images-na.ssl-images-amazon.com/images/I/51SPOk2fmnL._SX381_BO1,204,203,200_.jpg',
        title: 'Java 7 Programming Black Book',
        description: 'Best Java book!!',
        price: 410
    }),
    new Product({
        imagePath: 'https://images-na.ssl-images-amazon.com/images/I/51KEqIsBa4L._SX370_BO1,204,203,200_.jpg',
        title: 'C++ Book',
        description: 'Best C++ book!!',
        price: 520
    }),
    new Product({
        imagePath: 'https://images-na.ssl-images-amazon.com/images/I/51NuHATrs8L._SX354_BO1,204,203,200_.jpg',
        title: 'C Book',
        description: 'Best C book!!',
        price: 640
    }),
    new Product({
        imagePath: 'https://images.gr-assets.com/books/1328761672l/11318858.jpg',
        title: 'JavaScript Book',
        description: 'Now that is super awesome!',
        price: 515
    }),
    new Product({
        imagePath: 'http://imgs.zinio.com/dag/501076722/2017/416402990/cover.jpg?width=370&amp;height=477',
        title: 'Python Book',
        description: 'Best Python book!!',
        price: 450
    })
];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function(err, result) {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}