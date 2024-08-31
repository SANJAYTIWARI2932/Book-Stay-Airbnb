const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });




router.route("/")
    //index Route
    .get(wrapAsync(listingController.index))

    //Create Route
    .post(isLoggedIn, upload.single('listing[image]'),validateListing ,wrapAsync(listingController.createListing));
    

//new Route 
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.get("/category/:cate",listingController.category);
router.post("/destination",listingController.searchPlace);


router.route("/:id")
    //show ROute
    .get(wrapAsync(listingController.showListing))
    //update route
    .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
    //delete route
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destoryListing));


//Edit route
router.get("/:id/edit" ,isLoggedIn,isOwner,wrapAsync(listingController.renderEdit));


module.exports=router;

