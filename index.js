const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { campgroundSchema, reviewSchema } = require("./schemas");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utilities/catchAsync");
const ExpressError = require("./utilities/ExpressError");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");
const campgrounds = require('./routes/campgrounds')

mongoose.connect("mongodb://localhost:27017/yelp-camp", { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("error", console.error.bind(console, "connection error"));
mongoose.connection.once("open", () => console.log("database connected"));

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(urlencoded({ extended: true }));



const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};
app.use('/campgrounds', campgrounds)
app.get("/", (req, res) => {
	res.render("home");
});

app.post(
	"/campgrounds/:id/reviews",
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);
app.delete(
	"/campgrounds/:id/reviews/:reviewId",
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(req.params.reviewId);
		res.redirect(`/campgrounds/${id}`);
	})
);
app.all("*", (req, res, next) => {
	next(new ExpressError("Page not found!", 404));
});
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Oh no, something went wrong";
	res.status(statusCode).render("error", { err });
});
app.listen(3000, () => console.log("started listening to server on port 3000"));
