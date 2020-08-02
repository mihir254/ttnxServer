const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    _id:Number,
    contents:[{
        product:{
            type:String,
            ref:'Product'
        },
        size:String,
        color:String,
        price:Number,
        quantity:Number
    }],
    deliveryCharge:Number,
    address:{
        type:String,
        default:""
    },
    contact:Number,
    user:String,
    userName:String,
    amount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:"Pending"
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    deliveryDate:{
        type:Date,
    },
    payment:{
        method:{
            type:String,
            required:true
        },
        transactionid:{
            type:String,
            required:true
        }
    }
},{
    timestamps:true
});

const Order = mongoose.model('Order',orderSchema);
module.exports = Order;