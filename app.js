import express from 'express'
import { logger } from './middlewares/logger.js'
const app = express()
app.set('view engine', 'ejs');
app.set('views', './public/webpages')


app.use(logger)

app.use('/assets', express.static('public'))

app.use(express.urlencoded({ extended: true }))
const PORT = 3000

app.get('/', (request, response) => {
    response.render('index')
})

app.post('/contact', (request, response) => {
    console.log('Contact form submission: ', request.body)
    const userEmail = request.body.email_address;


    response.send(`Thank you for submitting your email address ${userEmail}`)

})

app.get('/search', (request, response) => {
    console.log(request.query)
    const userSearch = request.query.search;
    response.send(`you have searched ${userSearch}`)
})


app.get('/page/:id', (request, response) => {
    const pageId = request.params.id
    response
        .status(404)
        .send(`the page with the name ${pageId} could not be found`)
})

app.get('/homepage', (request, response) => {
    response.render('homepage')
})

app.get('/beer', (request, response) => {
    response.render('beer')
})


app.get('/wine', (request, response) => {
    response.render('wine')
})

app.get('/spirits', (request, response) => {
    response.render('spirits')
})

app.get('/champagne', (request, response) => {
    response.render('champagne')
})

app.get('/community', (request, response) => {
    response.render('community')
})





app.listen(PORT, () => {
    console.log(`👋 Started server on port ${PORT}`)
})

