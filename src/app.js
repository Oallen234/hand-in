import express, { response } from 'express'
import 'dotenv/config'
import { logger } from './middlewares/logger.js'
import fs from 'node:fs'
import beerdata from '../jasonnn/beer.json' with { type: "json" };
import winedata from '../jasonnn/wine.json' with { type: "json" }
import champagnedata from '../jasonnn/champagne.json' with { type: "json" }
import spiritsdata from '../jasonnn/spirits.json' with { type: "json" }
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { beerProductSchema } from './model-beer.js';
import { wineProductSchema } from './model-wine.js';
import { spiritsProductSchema } from './model-spirits.js';
import { champagneProductSchema } from './model-champage.js';
import jwt from 'jsonwebtoken';
// import { isLoggedIn } from './login.js';
import Email from './emails.js';
import cookieParser from 'cookie-parser'
// import loginRouter from './user-login.js'
import { User } from './user.js';
// import beerProducts from './model-beer.js';
// import champagneProduct from './model-champage.js';
// import wineProduct from './model-wine.js';
// import spiritsProducts from './model-spirits.js';

// import ProductSchema from './model.js';
import { request } from 'node:http';
// import { UserSchema } from './user-login.js';

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

const beerProducts = mongoose.model('beerProducts', beerProductSchema);

const wineProducts = mongoose.model('wineProducts', wineProductSchema);

const spiritsProducts = mongoose.model('spiritsProducts', spiritsProductSchema);

const champagneProduct = mongoose.model('champagneProduct', champagneProductSchema);

app.set('view engine', 'ejs');
app.set('views', './views')

app.use(cookieParser())
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

// MARK: SEEDING

// app.get("/seeding", async (request, response) => {
//     for (const spirits of spiritsdata.products) {
//         const product = new spiritsProducts({
//             name: spirits.name,
//             featured_img: spirits.featured_img,
//             route: spirits.route,
//             price_variation: spirits.price_variation,
//             category: spirits.category,
//             sub_category: spirits.sub_category,
//             brands: spirits.brands,

//         })

//         await product.save()
//     }
//     response.send("lmao")
// })

// MARK: Drinks data processing stuff

app.get('/beer/:id', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;

    const slug = request.params.id

    const beer = beerdata.products.find(beer => beer.route === slug)

    if (beer === undefined) {
        response.render('404', { error: "This beer does not exist" })
    }
    response.render('products-beer', {
        isLoggedIn: isLoggedIn,
        productTitle: beer.name,
        description: beer.category.description,
        lowproductPrice: beer.price_variation[0].price,
        highproductPrice: beer.price_variation[1].price,
        beer_image: beer.featured_img
        
    })
})


app.get('/wine/:id', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    const slug = request.params.id
    const wine = winedata.products.find(wine => wine.route === slug)

    if (wine === undefined) {
        response.render('404', { error: "This wine does not exist" })

    }
    response.render('products-wine', {
        isLoggedIn: isLoggedIn,
        productTitle: wine.name,
        description: wine.category.description,
        lowproductPrice: wine.price_variation[0].price,
        wine_image: wine.featured_img
    })
})


app.get('/spirits/:id', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    const slug = request.params.id

    const spirits = spiritsdata.products.find(spirits => spirits.route === slug)

    if (spirits === undefined) {
        response.render('404', { error: "These spirits do not exist" })
    }
    response.render('products-spirits', {
        isLoggedIn: isLoggedIn,
        productTitle: spirits.name,
        description: spirits.category.description,
        lowproductPrice: spirits.price_variation.price,
        spirits_image: spirits.featured_img
    })
})

app.get('/champagne/:id', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    const slug = request.params.id

    const champagne = champagnedata.products.find(champagne => champagne.route === slug)

    if (champagne === undefined) {
        response.render('404', { error: "This champagne does not exist" })
    }
    response.render('products-champagne', {
        isLoggedIn: isLoggedIn,
        productTitle: champagne.name,
        description: champagne.category.description,
        lowproductPrice: champagne.price_variation.price,
        champagne_image: champagne.featured_img
    })
})


// MARK: - Authentication

app.post('/create-account', async (request, response) => {
    try {


        const { email_address, name, age, password } = request.body

        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)

        const user = new User({
            email_address,
            name,
            age,
            passwordHash,
        })

        const savedUser = await user.save()

        response.status(201).redirect("/login")
    }
    catch (error) {
        console.error(error)
        response.send('Error: The account could not be created. Maybe it wasnt creative enough')
    }
})

app.post('/login', async (request, response) => {

    const { email_address, password } = request.body

    const user = await User.findOne({ email_address })
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password',

        }, response.redirect('/login')
        )
    }

    const userForToken = {
        email_address: user.email_address,
        id: user._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET)


    response
        .status(200)
    response.cookie('token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 30 * 1000,
    })
        .redirect('/')
})


app.get('/logout', async (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;

    response
        .clearCookie('token')
        .render('homepage', {
            isLoggedIn: isLoggedIn,
        })
})


// MARK: - drink stuff

app.post('/drinks/new', async (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    try {
        console.log(request.body);

        const drink = new Drinks({
            slug: request.body.slug,
            name: request.body.name,
            priceInCents: request.body.priceInCents
        })
        await drink.save()

        response.render('drinks/drinker', {
            isLoggedIn: isLoggedIn,

        })
    } catch (error) {
        console.error(error)
        response.send('Error: The drink could not be created. Maybe it wasnt creative enough')
    }
})

app.get('/drinks/all-drinks', async (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    const drinks = await Drinks.find({}).exec()


    response.render('drinks/all-drinks', {
        isLoggedIn: isLoggedIn,
        drinks: drinks,

    })


})

app.get('/drinks/edit-drinks/:slug', async (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    const slug = request.params.slug


    try {
        const slug = request.params.slug
        const drinks = await Drinks.findOne({ slug: slug }).exec()
        if (!drinks) throw new Error('Drink not found')

        response.render('drinks/edit-drinks', {
            isLoggedIn: isLoggedIn,
            drinks: drinks
        })
    }
    catch (error) {
        console.error(error)
        response.status(404).send('Could not find the drink you\'re looking for.')
    }

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
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    try {
        await Drinks.findOneAndDelete({ slug: request.params.slug })

        response.redirect('/drinks/all-drinks')

        
    } catch (error) {
        console.error(error)
        response.send('Error: No drink was deleted.')
    }
})


// MARK: Page Rendering
app.get('/create-account', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    response.render('login/create-account', {
        isLoggedIn: isLoggedIn,
    })
})


// app.get('/edit-account', (request, response) => {
//     response.render('login/edit-account')
// })

app.get('/beer', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    response.render('beer', {
        isLoggedIn: isLoggedIn,
        beers: beerdata.products
    })
})

app.get('/login', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    response.render('login/login', {
        isLoggedIn: isLoggedIn,

    })
})

app.get('/drinks/new', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    response.render('drinks/drinker', {
        isLoggedIn: isLoggedIn,
    })
})


app.get('/champagne', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    response.render('champagne', {
        isLoggedIn: isLoggedIn,
        champagnes: champagnedata.products
    })
})



app.get('/', (request, response) => {

    const token = request.cookies.token;
    console.log(token);

    const isLoggedIn = !!token;
    console.log(isLoggedIn);

    response.render('homepage', {
        isLoggedIn: isLoggedIn,
    });
})
app.get('/products-wine', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    response.render('products-wine', {
        isLoggedIn: isLoggedIn,

    })
})

app.get('/products-beer', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    response.render('products-beer', {
        isLoggedIn: isLoggedIn,

    })
})

app.get('/community', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;

    response.render('community', {
        isLoggedIn: isLoggedIn,

    })
})
app.get('/wine', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;

    response.render('wine', {
        isLoggedIn: isLoggedIn,
        wines: winedata.products
    });
})
app.get('/spirits', (request, response) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;
    response.render('spirits', {
        isLoggedIn: isLoggedIn,
        spiritss: spiritsdata.products
    })
})

app.all('*', (req, res) => {
    const token = request.cookies.token;
    const isLoggedIn = !!token;

    if (req.accepts('html')) {
        res.render('404', {
            isLoggedIn: isLoggedIn,
            error: 'This page does not exist'
        })
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

