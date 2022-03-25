const express = require('express')
const kafka = require('kafka-node')
const app = express()
var cors = require('cors')
const sequelize = require('sequelize')


app.use(express.json())
app.use(cors())

const dbConnected = async () => {
    console.log(process.env.POSTGRES_URL)
   const db = new sequelize('postgres://postgres:postgres@localhost:5432/dbname')
   const User = db.define('user', {
       name: sequelize.STRING,
       email: sequelize.STRING,
       password: sequelize.STRING
   })
   db.sync({force: true})
   const client = new kafka.KafkaClient({kafkaHost : 'localhost:process.env.KAFKA_BOOTSTRAP_SERVERS'})
const producer = new kafka.Producer(client)
producer.on('ready', async ()=>{
    app.post("/", async (req, res) =>{
        producer.send([{topic: process.env.KAFKA_TOPIC, messages: JSON.stringify(req.body)}], async (err, data)=>{
            if(err) console.log(err)
            else {
                await User.create(req.body)
                res.send(req.body)
            }
        })

})
})
}

console.log(`connected to : ${process.env.PORT}`)

setTimeout(dbConnected, 10000)
app.listen(process.env.PORT)