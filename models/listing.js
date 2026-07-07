
const mongoose = require("mongoose");
const reviews = require("./reviews");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,

    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1776785044825-57390a892be8?q=80&w=1026&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
    },

    price: {
        type:Number,
        required:true,
    },

    location: String,
    country: String,
     
    category: {
    type: String,
    required: true,
},

    latitude: Number,
    longitude: Number,
    

    reviews:[
        {
         type:Schema.Types.ObjectId,
         ref:"Review",   
        },
    ],
   
    bookings: [
  {
    type: Schema.Types.ObjectId,
    ref: "Booking",
  },
],

    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },


});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
await Review.deleteMany({_id : {$in : listing.reviews}});
    }
});




const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;