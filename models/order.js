import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      phoneNo: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    currency:{
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      
    },
    invoiceId:{
      type: String,
      
    },
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
        },
        price: {
          type: String,
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    paymentMethod: {
      type: String,
      required: [true, "Please select payment method"],
      enum: {
        values: ["COD", "Card"],
        message: "Please select: COD or Card",
      },
    },
    paymentInfo: {
      id: String,
      status: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    shippingAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: {
        values: ["Processing", "Shipped", "Delivered"],
        message: "Please select correct order status",
      },
      default: "Processing",
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);
orderSchema.pre("save", async function (next) {
  try {
    // Generate and set order ID if not present
    if (!this.orderId) {
      const lastOrder = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });

      const lastOrderId = lastOrder ? parseInt(lastOrder.orderId.split("-")[1]) : 0;
console.log(lastOrder,lastOrderId)
      this.orderId = `IP-ORD-${("0000" + (lastOrderId + 1)).slice(-5)}`;
    }

    // Generate and set invoice ID with present date if not present
    if (!this.invoiceId) {
      const lastInvoice = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
      const lastInvoiceId = lastInvoice ? parseInt(lastInvoice.invoiceId.split("-")[1]) : 0;

      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");

      this.invoiceId = `INV-${year}${month}${day}-${("0000" + (lastInvoiceId + 1)).slice(-5)}`;
    }

    next();
  } catch (error) {
    // next(error);
    console.log(error)
  }
});
export default mongoose.model("Order", orderSchema);