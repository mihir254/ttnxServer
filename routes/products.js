const express = require('express');
const Product = require('../models/product');
const User = require('../models/user');
const authenticate = require('../utils/authenticate');
const {upload} = require('../utils/upload');

const router = express.Router();

router.route('/')
    .post((req, res, next) => {
        Product.create({
            ...req.body
        })
            .then((prod) => {
                return Product.findById(prod._id).populate('category', 'name')
            })
            .then((prod) => res.send(prod))
            .catch((err) => next(err));
    })

router.get('/:prodId', (req, res, next) => {
    Product.findById(req.params.prodId)
        .then((product) => {
            res.send(product);
        })
        .catch((err) => next(err));
})

router.post('/search',(req, res, next) => {
    Product.find({deleted:{$ne:true},$text: {$search: req.body.keyword}},{score: {$meta: "textScore"}}).sort({score: {$meta: "textScore"}})
        .then((prods) => res.send(prods))
        .catch((err) => next(err));
})

router.put('/:prodId', upload.array('myImages'), (req,res,next) => {
    Product.findById(req.params.prodId)
        .then((prod) => {
            req.files.forEach(file => {
                prod.images.push(file.path);
            });
            return prod.save();
        })
        .then((prod) => res.send(prod))
        .catch((err) => next(err));
})

router.route('/:prodId/wishlist')
    .post(authenticate.verifyUser, (req, res, next) => {
        User.findByIdAndUpdate(req.user._id,
            { $addToSet: { wishlist: req.params.prodId } },
            { safe: true, upsert: true, new: true }).populate('wishlist')
            .then((user) => res.send({ wishlist: user.wishlist }))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        User.findByIdAndUpdate(req.user._id,
            {$pull:{wishlist: req.params.prodId}},
            { safe: true, upsert: true, new: true}).populate('wishlist')
            .then((user) => res.send({wishlist: user.wishlist}))
            .catch((err) => next(err));
    })

function updateUserCart(req,res,user){
    cart = user.cart
    for(let i=0;i<cart.length;i++){
        if(cart[i].product == req.params.prodId && cart[i].size == req.body.size && cart[i].color == req.body.color){
            cart[i].quantity += req.body.quantity
            user.cart = cart;
            return i
        }
    }
    cart.push({ product: req.params.prodId, color: req.body.color, size: req.body.size, quantity: req.body.quantity});
    return -1
}

function getCartItem(req,res,user){
    cart = user.cart
    for(let i=0;i<cart.length;i++){
        if(cart[i].product == req.params.prodId && cart[i].size == req.body.size && cart[i].color == req.body.color){
            return i
        }
    }
    return -1
}

router.route('/:prodId/cart')
    .post(authenticate.verifyUser, (req, res, next) => {
        var i = -1
        User.findById(req.user._id)
            .then((user) => {
                i =  updateUserCart(req,res,user)
                return User.populate(user,{path:'cart.product'})
            })
            .then((user) => {
                if(i>=0){
                    user.cartTotal += user.cart[i].price * req.body.quantity
                }
                else{
                    user.cart[cart.length - 1].price = user.cart[cart.length - 1].product.price * (1-user.cart[cart.length-1].product.discountPercentage/100)
                    user.cartTotal += user.cart[cart.length-1].price * req.body.quantity
                }
                res.json({cart:user.cart, cartTotal:user.cartTotal})
                user.save()
            })
            .catch((err) => next(err))
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        var i = -1
        User.findById(req.user._id)
            .then((user) => {
                i = getCartItem(req,res,user)
                if(i>=0){
                    user.cartTotal = user.cartTotal - user.cart[i].price * user.cart[i].quantity
                    user.cart.splice(i,1)
                }
                return User.populate(user,{path:'cart.product'})
            })
            .then((user) => {
                res.json({cart:user.cart,cartTotal:user.cartTotal})
                user.save()
            })
            .catch((err)=>next)
    })

module.exports = router;