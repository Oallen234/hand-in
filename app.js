import express from 'express'
import { logger } from './middlewares/logger.js'
import fs from 'node:fs'

const app = express()


app.set('view engine', 'ejs');
app.set('views', './public/webpages')


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


app.get('/use/:id', (request, response) => {
    const pageId = request.params.id
    response
        .render(pageId)
})

app.get('/use', (request, response) => {
    response.render('use')
})






app.get('/beer/:id', (request, response) => {
    const pageId = request.params.id
    response.render('dynamic-beer')
})

app.get('/', (request, response) => {
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

app.all('*', (req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    }
    else if (req.accepts('json')) {
        res.status(404).json({error: "404 Not Found"});
    } else {
        res.status(404).type('txt').send("404 Not Found");
        
    }
})




app.listen(PORT, () => {
    console.log(`👋 Started server on port ${PORT}`)
})

