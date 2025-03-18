import express from 'express'
import { logger } from './middlewares/logger.js'
import fs from 'node:fs'
import beerdata from '../jasonnn/beer.json' with { type: "json" };
import winedata from '../jasonnn/wine.json' with { type: "json" }
import champagnedata from '../jasonnn/champagne.json' with { type: "json" }
import spiritsdata from '../jasonnn/spirits.json' with { type: "json" }




const app = express()


app.set('view engine', 'ejs');
app.set('views', './views')


app.use(logger)

app.use('/assets', express.static('public'))

app.use(express.urlencoded({ extended: true }))
const PORT = 3000


app.post('/contact', (request, response) => {
    console.log('Contact form submission: ', request.body)
    const userEmail = request.body.email_address;
    try {
        fs.appendFileSync('public/emails.txt', userEmail + "\n")

    } catch (error) {
        console.error(error);

    }

    response.send(`Thank you for submitting your email address ${userEmail}`

    )

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

app.get('/beer', (request, response) => {
    response.render('beer', { beers: beerdata.products })

})

app.get('/wine/:id', (request, response) => {
    const slug = request.params.id
    const wine = winedata.products.find(wine => wine.route === slug)

    if (wine ===undefined) {
        response.render('404', {error: "This wine does not exist"})
        
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
    response.render('spirits', {spiritss: spiritsdata.products})
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
    response.render('champagne', {champagnes: champagnedata.products})
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

