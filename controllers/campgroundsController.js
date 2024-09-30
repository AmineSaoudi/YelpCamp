const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync');
const { cloudinary } = require('../cloudinary')
const maptilerClient = require('@maptiler/client')
maptilerClient.config.apiKey = process.env.MAPTILER_TOKEN


module.exports.index = catchAsync(async (req, res) => {
    const allCampgrounds = await Campground.find().populate('author');
    res.render('campgrounds/index', { allCampgrounds })
})



module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}



module.exports.createCampground = catchAsync(async (req, res, next) => {

    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location);
    req.body.campground.geometry = geoData.features[0].geometry

    req.body.campground.author = req.user._id;

    const campground = req.body.campground;
    const newCampground = new Campground(campground)

    const campgroundImages = req.files.map(file => ({ url: file.path, fileName: file.filename }))
    newCampground.images = campgroundImages;

    await newCampground.save();

    req.flash('success', 'Campground successfully created!');
    res.redirect(`/campgrounds/${newCampground._id}`);
})

module.exports.showCampground = catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
        .populate({
            path: 'reviews',
            populate: 'author'
        })
        .populate('author');

    if (!campground) {
        req.flash('error', 'Unable to find that Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
})

module.exports.destroyCampground = catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground successfully deleted!');
    res.redirect('/campgrounds');
})

module.exports.updateCampground = catchAsync(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);

    const campgroundImages = req.files.map(file => ({ url: file.path, fileName: file.filename }))

    if (req.body.deleteImages) {
        for (let fileName of req.body.deleteImages) {
            await cloudinary.uploader.destroy(fileName);
        }
        await campground.updateOne({ $pull: { images: { fileName: { $in: req.body.deleteImages } } } })
    }

    campground.images.push(...campgroundImages)

    await campground.save();

    req.flash('success', 'Campground successfully edited');
    res.redirect(`/campgrounds/${id}`);
})

module.exports.renderEditForm = catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Unable to find that Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
})
