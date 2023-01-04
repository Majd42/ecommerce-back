const express = require('express')
const cors = require('cors')
const items= require('./items.json')


require('dotenv').config()





const app = express();
app.use(express.json())
app.use(cors({
    origin: '*'
}))


const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

// const storeItems = new Map([
//    [ 1, {name: 'book', priceInCents: 1099 }],
//     [2, {name: 'computer', priceInCents: 119900 }],
//     [3, {name: 'Banana', priceInCents: 109 }],
//     [3, {name: 'Car', priceInCents: 1400000 }],
// ])

const storeItems = new Map(items.map(obj => [obj.id, {name: obj.name, priceInCents: obj.price, imgUrl: obj.imgUrl}]))




// const formattedStoreItems = Object.fromEntries(storeItems)


app.get('/store-items', (req, res) => {
    res.send(items)
})


app.post('/create-checkout-session', async  (req, res) => {
    

    try{
        const session = await stripe.checkout.sessions.create({


            line_items:req.body.shoppingCart.map(item => {
                
                const storeItem =  storeItems.get(item.id)
                
                

                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name,

                        },
                        
                        unit_amount : storeItem.priceInCents,
                    },
                    quantity: item.quantity
                }
            }),
          
            mode: 'payment',
            success_url: 'http://google.com/',
            cancel_url: 'http://google.com/',
        })
        
      res.json(session.url)
      
    }
    catch(e){
        res.status(500).json({error: e.message})
    }

    

})

app.listen(process.env.PORT || 5500)


