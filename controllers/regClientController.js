import Product from "../models/Product.js";
import Variant from "../models/Variant.js";
import Cart from "../models/Cart.js";
import ClientUser from "../models/ClientUser.js";
import Address from "../models/Address.js";
import Sale from '../models/Sale.js'
import SaleDetail from "../models/SaleDetail.js";
import Shipping from "../models/Shipping.js";
import cryptoRandomString from 'crypto-random-string';

const createCart = async (req, res) => {
    const cart = new Cart(req.body)
    const variant = await Variant.findById({_id: cart.variant})
    if(req.body.amountOfProducts <= variant.stock){
        const savedCart = await cart.save()
        return res.status(200).json(savedCart)
    } else{
        return res.status(200).json({msg: "No hay suficiente stock."})
    }
}

const getCart = async (req, res) => {
    const {user} = req.params
    const cart = await Cart.find({client: user}).populate('product').populate('variant').sort({createdAt: -1})
    return res.status(200).json(cart)
}

const deleteItemFromCart = async (req, res) => {
    const {id} = req.params
    const deletedItem = await Cart.findByIdAndDelete({_id:id})
    return res.status(200).json(deletedItem)
}

const saveAddress = async (req, res) => {
    const {id} = req.params
    const address = await Address.find({client:id})
    const newaddress = new Address(req.body)
    newaddress.client = id
    if(address.length === 0){
        const newAddress = await newaddress.save()
        return res.status(200).json(newAddress)
    }
    if(address[0].address === newaddress.address){
        return res.status(200).json({msg: 'Este domicilio de envío ya existe'})
    }
    if(address.length === 2){
        return res.status(200).json({msg: 'Solo podés agregar dos domicilios de envío'})
    }
    const newAddress = await newaddress.save()
    return res.status(200).json(newAddress)

}

const deleteAddress = async (req, res) => {
    const {id} = req.params
    const deletedAddress = await Address.findByIdAndDelete({_id:id})
    return res.status(200).json({msg:'Domicilio eliminado', deletedAddress})
}

const getAddressData = async (req, res) => {
    try {
        const {id} = req.params
        const address = await Address.find({client:id})
        return res.status(200).json(address)
    } catch (error) {
        console.log(error);
    }
}

const saleValidatePaymentId = async (req, res) => {
    const {payment_id} = req.params
    const sales = await Sale.find({transaction:payment_id})
    return res.status(200).json(sales)
}

const createSale = async (req, res) => {
    const sale = new Sale(req.body)
    console.log(sale);
    sale.year = new Date().getFullYear()
    sale.month = new Date().getMonth()+1
    sale.day = new Date().getDate()
    sale.status = 'approved'
    sale.orderNumber = cryptoRandomString({length: 10, type: 'numeric'})

    const saveSale = await sale.save()

    for(const item of req.body.saleDetail){
        
        item.year = new Date().getFullYear()
        item.month = new Date().getMonth()+1
        item.day = new Date().getDate()
        item.sale = sale._id
        const saleDetail = new SaleDetail(item)
        const savedSaleDetail = await saleDetail.save()

        // UPDATE STOCK //

        try {
            const variant = await Variant.findById(saleDetail.variant)
            const newStock = variant.stock - item.items
            await Variant.findByIdAndUpdate(saleDetail.variant, {stock: newStock})
        } catch (error) {
            console.log(error);
        }

        // DELETE VARIANT IF STOCK === 0 //

        /* try {
            const variant = await Variant.findById(saleDetail.variant)
            if(variant.stock === 0){
                const variant = await Variant.findOneAndRemove({_id: saleDetail.variant})
            }
        } catch (error) {
            console.log(error);
            
        }*/
        
    }
    await Cart.deleteMany({client: sale.client})

    return res.status(200).json(saveSale)
}

const getOrderData = async (req, res) => {
    const {id} = req.params
    if (id.match(/^[0-9a-fA-F]{24}$/)){
        const sale = await Sale.find({_id:id}).populate('address')

        const saleDetails = await SaleDetail.find({sale:id}).populate('product').populate('variant')
    
        return res.status(200).json({sale, saleDetails})
    }
    
}

const getOrders = async (req, res) => {
    const {id} = req.params
    if (id.match(/^[0-9a-fA-F]{24}$/)){
        const sales = await Sale.find({client:id}).sort({createdAt: -1}).populate('address')
        /* const saleDetails = await SaleDetail.find({sale:id}).populate('product').populate('variant')*/
        return res.status(200).json(sales)
    }
}

const getShippingMethods = async (req, res) => {
    const {id} = req.params
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        const shippMethods = await Shipping.findOne({seller: id})
        return res.status(200).json(shippMethods)
    } 
}




export {
    createCart,
    getCart,
    deleteItemFromCart,
    saveAddress,
    getAddressData,
    deleteAddress,
    saleValidatePaymentId,
    createSale,
    getOrderData,
    getOrders,
    getShippingMethods
}