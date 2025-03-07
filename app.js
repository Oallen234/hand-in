import express from 'express'
import { logger } from './middlewares/logger.js'
const app = express()
app.use(logger)


app.use('/assets', express.static('public'))
app.use(express.urlencoded({ extended: true }))
const PORT = 3000




app.post('/contact', (request, response) => {
    console.log('Contact form submission: ', request.body)
    const userEmail = request.body.email_address;

    response.send(`Thank you for submitting your email address ${userEmail}`)

})

app.get('/search',(request, response) => {
    console.log(request.query)
    const userSearch = request.query.search;
    response.send(`you have searched ${userSearch}`)
})









app.get('/', (request, response) => {
    response.send('Welcome to my 🍪 Cookieshop!')
  })

app.get('/cookies', (request, response) => {
    console.log(request.query)

    response.send('Here you find my cookies')
})

app.get('/cookies/:chocolate-chip', (request,response) => {
    const cookieId = request.params.id
    response.send('Chocolate Chip. A tasty, sugary cookie filled with chocolate chips. It costs $3.50')
})






app.listen(PORT, () => {
  console.log(`👋 Started server on port ${PORT}`)
})

