const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
// const maptilerClient = require('@maptiler/client')
// require('dotenv').config();

// maptilerClient.config.apiKey = process.env.MAPTILER_TOKEN

const mongoose = require('mongoose');
const Campground = require('.././models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const seedDB = async (num) => {
    await Campground.deleteMany({});
    for (let i = 0; i < num; i++) {
        const rand = (array) => array[Math.floor(Math.random() * array.length)];
        const city = rand(cities);

        // const geoData = await maptilerClient.geocoding.forward(`${city.city}, ${city.state}`);

        const newCamp = new Campground({
            title: `${rand(descriptors)} ${rand(places)}`,
            location: `${city.city}, ${city.state}`,
            images: {
                url: 'https://res.cloudinary.com/dkcdmggfr/image/upload/v1727399863/YelpCamp/w1q6ln3eh3f968slrtae.jpg',
                fileName: 'YelpCamp/w1q6ln3eh3f968slrtae',
            },
            geometry: {
                type: "Point",
                coordinates: [city.longitude, city.latitude]
            },
            price: 10,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam nemo expedita, quae aspernatur ipsam libero omnis hic quam ipsa fugiat non suscipit voluptatibus voluptates atque eius. Consequuntur magni pariatur ipsum.',
            author: '66f44e1d4626c6bfedfa2483'
        })
        await newCamp.save();
    }
}

seedDB(300).then(() => {
    console.log("Campgrounds Seeded");
    mongoose.connection.close();
})


