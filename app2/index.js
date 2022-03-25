const express = require('express')
const kafka = require('kafka-node')
const app = express()
var cors = require('cors')
const mongoose = require('mongoose')
app.use(express.json())
app.use(cors())


const dbConnected = async () => {
 mongoose.connect(process.env.MONGO_URL)
 const User = new mongoose.model('user', {
     name: String,
     email: String,
     password: String
 })
 const client = new kafka.KafkaClient({kafkaHost : 'localhost:process.env.KAFKA_BOOTSTRAP_SERVERS'})
 const consumer = new kafka.Consumer(client, [{topic:process.env.KAFKA_TOPIC}], {
     autoCommit: false,

 })
 consumer.on('message', async(message)=>{
    const user = await new User(JSON.parse(message.value))
    await user.save
})
consumer.on('error', (err) => {
    console.log(err)
})
}

console.log(process.env.PORT)
setTimeout(dbConnected, 10000)
app.listen(process.env.PORT)