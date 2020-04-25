const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async(req, resp, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.HASH_SECRET)
        const user = await User.findOne({_id: decoded._id, "tokens.token": token})
        if (!user) throw new Error()

        req.user = user
        req.token = token

        next()
    } catch (e) {
        resp.status(401).send({error:"Invalid Authentication"})
    }
}

module.exports = auth