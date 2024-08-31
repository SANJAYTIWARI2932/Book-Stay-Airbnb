const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });




module.exports.index = async (req,res)=>{
    const allListings = await Listing.find();
    res.render("./listings/index.ejs",{allListings});
}

module.exports.category = async(req,res)=>{
    let {cate} = req.params;

    const allListings = await Listing.find({category:cate});
    if(allListings.length!=0){
        res.render("./listings/index.ejs",{allListings});
    }else{
        req.flash("error","This category does not have any listing");
        res.redirect("/listings");
    }
}

module.exports.searchPlace = async(req,res)=>{
    let {place} = req.body;
    let arr = place.split(",");
    const allList = await Listing.find();
    let allListings = allList.filter((list)=>list.location.split(",")[0] === arr[0]);
    if(allListings.length!=0){
        res.render("./listings/index.ejs",{allListings});
    }else{
        req.flash("error","This Destination does not have any listing");
        res.redirect("/listings");
    }
}

module.exports.renderNewForm=(req,res)=>{
    res.render("./listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id).populate({path:"reviews", populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exits!");
        res.redirect("/listings"); 
    }
    
    res.render("listings/show.ejs",{listing});
};


// module.exports.createListing = async (req, res, next) => {
//     let response = await geocodingClient.forwardGeocode({
//       query: req.body.listing.location,
//       limit: 1
//     }).send();
//     let url = req.file.path;
//     let filename = req.file.filename;
//     const newListing = new Listing(req.body.listing);
//     console.log(newListing);
//     newListing.owner = req.user._id;
//     newListing.image = { url, filename };
//     newListing.geometry = response.body.features[0].geometry;
//     let savedListing = await newListing.save();
//     console.log(savedListing);
//     req.flash("success", "New Listing created!");
//     res.redirect("/listings");
//   };

module.exports.createListing = async (req, res, next) => {
    try {
      // Forward geocode to get coordinates based on location
      const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      }).send();
  
      // Extract image URL and filename from the uploaded file
      const url = req.file.path;
      const filename = req.file.filename;
  
      // Create a new Listing instance with data from the request body
      const newListingData = {
        title: req.body.listing.title,
        description: req.body.listing.description,
        price: req.body.listing.price,
        location: req.body.listing.location,
        country: req.body.listing.country,
        category: req.body.listing.category,
        owner: req.user._id, // Assuming req.user contains authenticated user data
        image: { url, filename },
        geometry: response.body.features[0].geometry
      };
  
      const newListing = new Listing(newListingData);
  
      // Save the new listing to the database
      const savedListing = await newListing.save();
  
      // Redirect to the listings page with a success flash message
      req.flash("success", "New Listing created!");
      res.redirect("/listings");
    } catch (error) {
      // Handle any errors that occur during listing creation
      console.error("Error creating listing:", error);
      req.flash("error", "Failed to create new listing. Please try again.");
      res.redirect("/listings");
    }
  };
  
// Inside your createListing controller function
// module.exports.createListing = async (req, res, next) => {
//     try {
//         console.log(req.body);

//     } catch (error) {
//         console.error("Error creating listing:", error);
//         req.flash("error", "Failed to create new listing. Please try again.");
//         res.redirect("/listings");
//     }
// };

  
module.exports.renderEdit=async(req,res) =>{
let {id}=req.params;
const listing=await Listing.findById(id);
if(!listing){
    req.flash("error","Listing you requested for does not exits!");
    res.redirect("/listings"); 
}
let originalImageUrl=listing.image.url;
originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
res.render("listings/edit.ejs",{listing,originalImageUrl})
};

module.exports.updateListing=async (req,res) =>{
let{id}=req.params;
let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

if(typeof req.file !=="undefined"){
    let url= req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
}

req.flash("success","Listing Updated");

res.redirect(`/listings/${id}`);
}; 

module.exports.destoryListing=async(req,res)=>{
let{id}=req.params;
let deletedListing=await Listing.findByIdAndDelete(id);
console.log(deletedListing);
req.flash("success","Listing Deleted!");

res.redirect("/listings");
};