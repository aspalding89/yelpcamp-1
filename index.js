const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const catchAsync = require('./utilities/catchAsync')
const methodOverride = require("method-override")
const Campground = require("./models/campground")
const { urlencoded } = require("express")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})

mongoose.connection.on("error", console.error.bind(console, "connection error"))
mongoose.connection.once("open", () => console.log("database connected"))

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(methodOverride("_method"))
app.use(urlencoded({ extended: true }))
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")))
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")))

app.get("/", (req, res) => {
	res.render("home")
})
app.get("/campgrounds", async (req, res) => {
	const campgrounds = await Campground.find({})
	res.render("campgrounds/index", { campgrounds })
})
app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new")
})
app.post("/campgrounds", catchAsync(async (req, res, next) => {	
		const campground = new Campground(req.body.campground)
		await campground.save()
		res.redirect(`/campgrounds/${campground._id}`)
	
}))
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	res.render("campgrounds/show", { campground })
}))
app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	res.render("campgrounds/edit", { campground })
}))
app.put("/campgrounds/:id", catchAsync(async (req, res) => {
	const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground })
	res.redirect(`/campgrounds/${campground._id}`)
}))
app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id)
	res.redirect("/campgrounds")
}))
app.use((err, req, res, next) => {
	res.send("oh, boy something went wrong.")
})
app.listen(3000, () => console.log("started listening to server on port 3000"))
