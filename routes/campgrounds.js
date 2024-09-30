const express = require('express');
const router = express.Router({ mergeParams: true });

const campgroundsController = require('../controllers/campgroundsController')

const { campgroundSchema } = require('../joiSchemas')
const { isLoggedIn, validate, isAuthor } = require('../middleware')

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(campgroundsController.index)
    .post(isLoggedIn, upload.array('campground[image]'), validate(campgroundSchema), campgroundsController.createCampground)



router.get('/new', isLoggedIn, campgroundsController.renderNewForm);

router.route('/:id')
    .get(campgroundsController.showCampground)
    .delete(isLoggedIn, isAuthor, campgroundsController.destroyCampground)
    .put(isLoggedIn, isAuthor, upload.array('campground[image]'), validate(campgroundSchema), campgroundsController.updateCampground)


router.get('/:id/edit', isLoggedIn, isAuthor, campgroundsController.renderEditForm);



module.exports = router;