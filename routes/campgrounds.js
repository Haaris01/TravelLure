const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const campground = require('../controllers/campgrounds');
const multer = require('multer')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const { storage, cloudinary } = require('../cloudinary/index');
const upload = multer({ storage });



router.route('/')
    .get(catchAsync(campground.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.createCampground))
// .post(upload.array('image'),(req, res) => {
//     console.log(req.body, req.files);
//     res.send('It worked')
// })

router.get('/new', isLoggedIn, campground.renderCreateCampgroundForm);

router.route('/:id')
    .get(catchAsync(campground.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campground.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.renderEditForm));


module.exports = router;



// router.get('/', catchAsync(campground.index));
// router.post('/',isLoggedIn, validateCampground, catchAsync(campground.createCampground));

// router.put('/:id',isLoggedIn, isAuthor,validateCampground, catchAsync(campground.editCampground));

// router.get('/:id/edit', isLoggedIn, isAuthor,catchAsync(campground.renderEditForm));


// router.get('/new', isLoggedIn, campground.renderCreateCampgroundForm);

// router.get('/:id', catchAsync(campground.showCampground));

// router.delete('/:id', isLoggedIn,isAuthor,catchAsync(campground.deleteCampground));