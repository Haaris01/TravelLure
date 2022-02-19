const mongoose = require('mongoose');
const Campground = require('../models/campground');
mongoose.connect('mongodb://localhost:27017/YelpCamp');
const db = mongoose.connection;
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

db.on('error', err => {
    console.log(err);
});
db.once('open', () => {
    console.log("database connected".toUpperCase());
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 1000; i++) {
        const price = Math.floor(Math.random() * 20) + 10;
        const sampleCity = sample(cities);
        const c = new Campground({
            author: '6207304a16f31a0b8d923489',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${sampleCity.city} , ${sampleCity.state}`,
            description: '  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo aliquid, esse impedit, inventore laboriosam suscipit fugiat laudantium deserunt harum, numquam cum sapiente! Tempora distinctio in odio nisi accusantium, illo eaque!',
            price,
            geometry : {
                type : 'Point',
                coordinates : [sampleCity.longitude, sampleCity.latitude],
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dqevklduu/image/upload/v1644989987/YelpCamp/ejrppovvlnboqe3eng6z.jpg',
                    filename: 'YelpCamp/elpbcsbbirjtemkuei97',
                },
                {
                    url: 'https://res.cloudinary.com/dqevklduu/image/upload/v1644984208/YelpCamp/ge3mvfyu1oajsktnhw1r.jpg',
                    filename: 'YelpCamp/j994h3ev7syway9kf3bg',
                }

            ],
        })
        await c.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
