// otpModel.js
import mongoose from 'mongoose'

const CurrencySchema = new mongoose.Schema({
currencyValue: { type: Number,required: true }

});

export default mongoose.model('Currency', CurrencySchema);

