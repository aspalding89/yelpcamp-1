const cities = require("./cities")
const { places, descriptors } = require("./seedHelper")
const mongoose = require("mongoose")
const Campground = require("../models/campground")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})

mongoose.connection.on("error", console.error.bind(console, "connection error"))
mongoose.connection.once("open", () => {
	console.log("database connected")
})

// SEED THE DATABASE

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
	await Campground.deleteMany({})
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000)
		const price = Math.floor(Math.random() * 20) + 10
		const camp = new Campground({
			title: `${sample(descriptors)} ${sample(places)}`,
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			image: "https://source.unsplash.com/collection/483251",
			description:
				"Pellentesque vel ornare arcu, non tempor risus. Cras facilisis nibh vel pellentesque scelerisque. Mauris quis mi vel enim tincidunt sodales ut id nunc. Nulla facilisi. Sed in nisl faucibus, euismod ipsum efficitur, accumsan velit. Curabitur a nisi risus. Duis porttitor nisi vel varius placerat. Suspendisse tellus magna, convallis vel dui. ",
			price
		})
		await camp.save()
	}
}
seedDB().then(() => mongoose.connection.close())
