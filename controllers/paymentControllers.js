// import catchAsyncErrors from "../middlewares/catchAsyncErrors.js"
// import Stripe from "stripe"

// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// // Create stripe checkout session => /api/v1/payment/checkout_session

// export const stripeCheckoutSession = catchAsyncErrors(async (req, res, next) => {

//     async (req, res, next) => {

//         const body = req?.body

//         const line_items = body?.orderItems?.map((item) => {
//             return {
//                 price_data: {
//                     currency: "USD",
//                     product_data: {
//                         name: item?.name,
//                         image: [item?.image],
//                         metadata: { productId: item?.product },
//                     },
//                     unit_amount: item?.price * 100
//                 },
//                 tax_rates: ["txr_1OESIISF2IZjmMPoiwryTLTq"],
//                 quantity: item?.quantity
//             };
//         });

//         const shippingInfo = body?.shippingInfo

//         const shipping_rate = body?.itemsPrice >= 200 ? "shr_1OERZFSF2IZjmMPos7cm5f1S" : "shr_1OERagSF2IZjmMPo3hfv2wbr"

//         const session = await stripe.checkout.session.create({
//             payment_method_types: ['card'],
//             success_url: `${process.env.FRONTEND_URL}/me/orders`,
//             cancel_url: `${process.env.FRONTEND_URL}`,
//             customer_email: req?.user?.email,
//             client_reference_id: req?.user?._id?.toString(),
//             mode: 'payment',
//             metadata: { ...shippingInfo, itemsPrice: body?.itemsPrice },
//             shipping_options: [
//                 {
//                     shipping_rate,
//                 },
//             ],
//             line_items,
//         });
//         console.log("-------------------");
//         console.log(session);
//         console.log("-------------------");
//     }

//     res.status(200)?.json({
//         url: session.url,
//     })


// })
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/order.js";

import Stripe from "stripe";
const stripe = Stripe('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');
import Product from'../models/product.js'
// Create stripe checkout session   =>  /api/v1/payment/checkout_session
export const stripeCheckoutSession = catchAsyncErrors(
  async (req, res, next) => {
    console.log("payment checkout session is running")
    const body = req?.body;
    let currency='usd'
    let hashvalue='shr_1OGMGAHxCBu9c7Ql1rUWVM3A'
    if(req.body.currency === "inr"){
      currency="inr"
      hashvalue="shr_1OFGIEHxCBu9c7QlYdczX4VT"
    }
    if(req.body.currency === "eur"){
      currency="eur"
      hashvalue="shr_1OGMKeHxCBu9c7QlICQ76Afv"

    }
    if(req.body.currency === "uk" ){
      currency="gbp"
      hashvalue="shr_1OGMM3HxCBu9c7Ql1a5EqPfz"
    }
    

    const taxRate = await stripe.taxRates.create({
      display_name: 'VAT',
      description: 'VAT',
      percentage: 20,
      jurisdiction: 'DE',
      inclusive: false,
    });
    console.log(taxRate)

    const line_items = body?.orderItems?.map((item) => {
      return {
        price_data: {
          currency:currency, 
          product_data: {
            name: item?.name,
            images: [item?.image],
            metadata: { productId: item?.product },
          },
          unit_amount: item?.price * 100,
        },
        tax_rates: [`${taxRate.id}`],
        quantity: item?.quantity,
      };
    });
    const shippingInfo = body?.shippingInfo;
console.log(shippingInfo,line_items)

   

const shippingRate = await stripe.shippingRates.create({
  display_name: 'Ground shipping',
  type: 'fixed_amount',
  fixed_amount: {
    amount: 0,
    currency: currency,
  },
});

    //inr shr_1OFGIEHxCBu9c7QlYdczX4VT

    const shipping_rate =shippingRate.id
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${`https://ecommerce-website-mauve-beta.vercel.app/`}/me/order`,
      cancel_url: `${`https://ecommerce-website-mauve-beta.vercel.app`}/`,
      customer_email: req?.user?.email,
      client_reference_id: req?.user?._id?.toString(),
      mode: "payment",
      metadata: { ...shippingInfo, itemsPrice: body?.itemsPrice },
      shipping_options: [
        {
          shipping_rate,
        },
      ],
      line_items,
    });
    console.log(session)

    res.status(200).json({
      url: session.url,
    });
  }
);

const getOrderItems = async (line_items) => {
  return new Promise((resolve, reject) => {
    let cartItems = [];

    line_items?.data?.forEach(async (item) => {
      const product = await stripe.products.retrieve(item.price.product);
      const productId = product.metadata.productId;
      const productImg = await Product.findById(productId)
      cartItems.push({
        product: productId,
        name: product.name,
        price: item.price.unit_amount_decimal / 100,
        quantity: item.quantity,
        image:productImg.attributes.image[0],
      });

      if (cartItems.length === line_items?.data?.length) {
        resolve(cartItems);
      }
    });
  });
};

// Create new order after payment   =>  /api/v1/payment/webhook
export const stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  console.log("webhook csme")

  try {
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      'whsec_LezWmjQjOlL8Pe6vx3JksEbvqlElcP1n'
    );
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const line_items = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      const orderItems = await getOrderItems(line_items);
      const user = session.client_reference_id;

      const totalAmount = session.amount_total / 100;
      const taxAmount = session.total_details.amount_tax/100
      const shippingAmount =session.total_details.amount_shipping/100
      const itemsPrice = session.metadata.itemsPrice

      const shippingInfo = {
        address: session.metadata.address,
        city: session.metadata.city,
        phoneNo: session.metadata.phoneNo,
        zipCode: session.metadata.zipCode,
        country: session.metadata.country,
      };

      const paymentInfo = {
        id: session.payment_intent,
        status: session.payment_status,
      };

      const orderData = {
        currency:session.currency,
        shippingInfo,
        orderItems,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentInfo,
        paymentMethod: "Card",
        user,
      };

      await Order.create(orderData);

      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.log("Error => ", error);
  }
});