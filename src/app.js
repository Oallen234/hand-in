import express, { response } from 'express'
import 'dotenv/config'
import { logger } from './middlewares/logger.js'
import fs from 'node:fs'
import beerdata from '../jasonnn/beer.json' with { type: "json" };
import winedata from '../jasonnn/wine.json' with { type: "json" }
import champagnedata from '../jasonnn/champagne.json' with { type: "json" }
import spiritsdata from '../jasonnn/spirits.json' with { type: "json" }
import mongoose from 'mongoose'
import Email from './emails.js';
import User from './user-login.js';
import beerProducts from './model-beer.js';
import champagneProduct from './model-champage.js';
import wineProduct from './model-wine.js';
import spiritsProducts from './model-spirits.js';

// import ProductSchema from './model.js';
import { request } from 'node:http';
import { UserSchema } from './user-login.js';

const app = express()
process.env.DATEBASE_PASSWORD
const DB_URI = process.env.DB_URI
mongoose.connect(DB_URI)

// const Product = mongoose.model('Product', ProductSchema);

const drinksSchema = new mongoose.Schema({
    slug: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    priceInCents: { type: Number, required: true },
    isInStock: { type: Boolean, default: true, required: true }
})
const Drinks = mongoose.model('Drink', drinksSchema)

app.set('view engine', 'ejs');
app.set('views', './views')


app.use(logger)

app.use('/assets', express.static('public'))

app.use(express.urlencoded({ extended: true }))
const PORT = 3000


app.post('/contact', async (request, response) => {
    try {
        console.log('Contact form submission: ', request.body);

        const newEmailSubmission = new Email({
            name: request.body.name,
            email: request.body.email_address

        });

        const savedEmail = await newEmailSubmission.save();

        response.status(200).render('homepage');

    }
    catch (error) {
        console.error('Error saving email submission:', error);

        response.status(500).json({
            success: false,
            message: 'Failed to save email submission',
            error: error.message
        });
    }
})

app.get('/search', (request, response) => {
    console.log(request.query)
    const userSearch = request.query.search;
    response.send(`you have searched ${userSearch}`)
})

app.get('/products-beer', (request, response) => {
    response.render('products-beer')
})


app.get('/beer/:id', (request, response) => {
    const slug = request.params.id

    const beer = beerdata.products.find(beer => beer.route === slug)

    if (beer === undefined) {
        response.render('404', { error: "This beer does not exist" })
    }
    response.render('products-beer', {
        productTitle: beer.name,
        description: beer.category.description,
        lowproductPrice: beer.price_variation[0].price,
        highproductPrice: beer.price_variation[1].price,
        beer_image: beer.featured_img
    })
})




app.get("/seeding", async (request, response) => {
    for (const spirits of spiritsdata.products) {
        const product = new spiritsProducts({
            name: spirits.name,
            featured_img: spirits.featured_img,
            route: spirits.route,
            price_variation: spirits.price_variation,
            category: spirits.category,
            sub_category: spirits.sub_category,
            brands: spirits.brands,

        })

        await product.save()
    }
    response.send("lmao")
})






app.get('/beer', (request, response) => {

    response.render('beer', { beers: beerdata.products })
})

app.get('/wine/:id', (request, response) => {
    const slug = request.params.id
    const wine = winedata.products.find(wine => wine.route === slug)

    if (wine === undefined) {
        response.render('404', { error: "This wine does not exist" })

    }
    response.render('products-wine', {
        productTitle: wine.name,
        description: wine.category.description,
        lowproductPrice: wine.price_variation[0].price,
        wine_image: wine.featured_img
    })
})


app.get('/wine', (request, response) => {
    response.render('wine', { wines: winedata.products })
})

app.get('/spirits/:id', (request, response) => {
    const slug = request.params.id

    const spirits = spiritsdata.products.find(spirits => spirits.route === slug)

    if (spirits === undefined) {
        response.render('404', { error: "These spirits do not exist" })
    }
    response.render('products-spirits', {
        productTitle: spirits.name,
        description: spirits.category.description,
        lowproductPrice: spirits.price_variation.price,
        spirits_image: spirits.featured_img
    })
})


app.get('/spirits', (request, response) => {
    response.render('spirits', { spiritss: spiritsdata.products })
})

app.get('/champagne/:id', (request, response) => {
    const slug = request.params.id

    const champagne = champagnedata.products.find(champagne => champagne.route === slug)

    if (champagne === undefined) {
        response.render('404', { error: "This champagne does not exist" })
    }
    response.render('products-champagne', {
        productTitle: champagne.name,
        description: champagne.category.description,
        lowproductPrice: champagne.price_variation.price,
        champagne_image: champagne.featured_img
    })
})


app.get('/champagne', (request, response) => {
    response.render('champagne', { champagnes: champagnedata.products })
})

app.get('/', (request, response) => {
    response.render('homepage')
})


app.get('/products-wine', (request, response) => {
    response.render('products-wine')
})




app.get('/community', (request, response) => {
    response.render('community')
})

app.post('/create-account', async (request, response) => {
    try {
        console.log(request.body);

        const user = new User({
            name: request.body.name,
            email_address: request.body.email_address,
            age: request.body.age,
            password: request.body.password
        })
        await user.save()
        response.redirect('login')
    }
    catch (error) {
        console.error(error)
        response.send('Error: The account could not be created. Maybe it wasnt creative enough')
    }
})



// app.get('/edit-account', async (request, response) => {
//     const slug = request.params.slug

//     try {
//         const slug = request.params.slug
//         const user = await User.findOne({ user: User }).exec()
//         response.render('login/edit-account', { user: User });

//     }


//     catch (error) {
//         console.error(error);
//         response.status(500).send('Error loading edit account page');
//     }

// });

app.post('/login', async (request, response) => {
    try {
        const { email_address, password } = request.body;
        const user = await User.findOne({ email_address });
        response.redirect('/');
    }
    catch (error) {
        console.error(error)
        response.send('Error: Incorrect login')

    }
})


app.post('/drinks/new', async (request, response) => {
    try {
        console.log(request.body);

        const drink = new Drinks({
            slug: request.body.slug,
            name: request.body.name,
            priceInCents: request.body.priceInCents
        })
        await drink.save()

        response.render('drinks/drinker')
    } catch (error) {
        console.error(error)
        response.send('Error: The drink could not be created. Maybe it wasnt creative enough')
    }
})

app.get('/drinks/all-drinks', async (request, response) => {
    const drinks = await Drinks.find({}).exec()


    response.render('drinks/all-drinks', {
        drinks: drinks,

    })


})

app.get('/drinks/edit-drinks/:slug', async (request, response) => {
    const slug = request.params.slug


    try {
        const slug = request.params.slug
        const drinks = await Drinks.findOne({ slug: slug }).exec()
        if (!drinks) throw new Error('Drink not found')

        response.render('drinks/edit-drinks', { drinks: drinks })
    }
    catch (error) {
        console.error(error)
        response.status(404).send('Could not find the drink you\'re looking for.')
    }

})


app.get('/create-account', (request, response) => {
    response.render('login/create-account')
})
app.get('/test', (request, response) => {
    response.render('test')
})

app.get('/edit-account', (request, response) => {
    response.render('login/edit-account')
})

app.get('/login', (request, response) => {
    response.render('login/login')
})

app.get('/drinks/new', (request, response) => {
    response.render('drinks/drinker')
})





app.post('/drinks/:slug', async (request, response) => {
    try {

        const drink = await Drinks.findOneAndUpdate(
            { slug: request.params.slug },
            request.body,

        )
        console.log(request.body);

        await drink.save()
        response.redirect('/drinks/all-drinks')
    } catch (error) {
        console.error(error)
        response.send('Error: The drink could not be created. Maybe it wasnt creative enough')
    }
})
app.get('/drinks/:slug/delete', async (request, response) => {
    try {
        await Drinks.findOneAndDelete({ slug: request.params.slug })

        response.redirect('/drinks/all-drinks')
    } catch (error) {
        console.error(error)
        response.send('Error: No drink was deleted.')
    }
})

app.all('*', (req, res) => {
    if (req.accepts('html')) {
        res.render('404', { error: 'This page does not exist' })
    }
    else if (req.accepts('json')) {
        res.status(404).json({ error: "404 Not Found" });
    } else {
        res.status(404).type('txt').send("404 Not Found");
    }
})






app.listen(PORT, () => {
    console.log(`👋 Started server on port ${PORT}`)
})

