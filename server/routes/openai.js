import { Router } from "express";
import dotnet from 'dotenv'
import { Configuration, OpenAIApi } from 'openai'
import chat from "../helpers/chat.js";

dotnet.config()

let router = Router()

const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

router.get('/', (req, res) => {
    res.send("Welcome to chatGPT api v1")
})

router.post('/', async (req, res) => {
    const { prompt } = req.body

    let response = {}

    try {
        response.openai = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ "role": "user", "content": prompt }]
        })

        response.db = await chat.newResponse(prompt, response)
    } catch (err) {
        res.status(500).json({
            status: 500,
            message: 'Error'
        })
    } finally {
        if (response.db && response.openai) {
            res.status(200).json({
                status: 200,
                message: 'Success',
                data: {
                    _id: response.db['insertedId'].toString(),
                    content: response.openai?.['data']?.choices[0].message.content
                }
            })
        }
    }
})

router.put('/', async (req, res) => {
    const { prompt, _id } = req.body

    let response = {}

    try {
        response.openai = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ "role": "user", "content": prompt }]
        })

        response.db = await chat.updateChat(_id, prompt, response)
    } catch (err) {
        res.status(500).json({
            status: 500,
            message: err
        })
    } finally {
        if (response.db && response.openai) {
            res.status(200).json({
                status: 200,
                message: 'Success',
                data: {
                    content: response.openai?.['data']?.choices[0].message.content
                }
            })
        }
    }
})

export default router