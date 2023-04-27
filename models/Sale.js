import mongoose, { Schema } from 'mongoose';

const saleSchema = mongoose.Schema({
    orderNumber: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    shippingPrice: {
        type: Number,
        required: true
    },
    shipMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    statusStr: {
        type: String,
        required: false,
        default: 'En preparación'
    },
    client: {
        type: Schema.ObjectId, ref: 'Client',
        required: true
    },
    address: {
        type: Schema.ObjectId, ref: 'Address',
        required: true
    },
    transaction: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    day: {
        type: Number,
        required: true
    },
    trackingCode: {
        type: String,
        required: false,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
})

const Sale = mongoose.model('Sale', saleSchema)
export default Sale