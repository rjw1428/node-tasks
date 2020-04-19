const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const multer = require('multer')
const upload = multer({
    // dest: 'avatar',
    limits: {
        fileSize: 1000000 //1Mb
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return callback(new Error("File must be an image"))
        callback(undefined, true)
    }
}) 
const router = new express.Router()

// CREATE USER ENDPOINT
router.post('/users', async (req, resp) =>{
    const user = new User(req.body)
    try {
        const token = await user.generateAuthToken()
        resp.status(201).send({status: "New User Received", token: token})
    } catch(e) {
        resp.status(400).send("Something went wrong\n"+e.message)
    }
})

// VALIDATE USER LOGIN
router.post('/users/login', async (req, resp)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        resp.send({user, token})
    } catch (e) {
        resp.status(400).send()
    }
})

// LOGOUT USER AND REMOVE TOKEN
router.get('/users/logout', auth, async (req, resp)=>{
    try {
        req.user.tokens = req.user.tokens.filter(token=>token.token!==req.token)
        await req.user.save()

        resp.send("Logout success")
    } catch (e) {
        resp.status(400).send()
    }
})

// LOGOUT USER AND REMOVE ALLTOKEN
router.get('/users/logoutAll', auth, async (req, resp)=>{
    try {
        req.user.tokens = []
        await req.user.save()

        resp.send("Logout success, tokens cleared")
    } catch (e) {
        resp.status(400).send()
    }
})


// GET USERS ENPOINT
// router.get('/users', auth, (req, resp) =>{
//     User.find({})
//     .then(users=>{
//         resp.send(users)
//     })
//     .catch(e=>{
//         resp.status(500).send()
//     })
// })

//GET MY USER INFO
router.get('/users/me', auth, (req, resp) =>{
    resp.send(req.user)
})

// GET USER BY ID
// router.get('/users/:id', (req, resp) =>{
//     User.findById(req.params.id)
//     .then(user=>{
//         if (!user)
//             return resp.status(404).send()
//         resp.send(user)
//     })
//     .catch(e=>{
//         resp.status(500).send()
//     })
// })


// UPDATE USER BY ID
// router.patch('/users/:id', auth, async (req, resp) =>{
//     const updates = Object.keys(req.body)
//     const allowedParams = Object.keys(User.schema.paths)
//     const isValid = updates.every(update=>allowedParams.includes(update))
//     if (!isValid) return resp.status(400).send("Some paramaters are not valid")

//     try {
//         // Original Update that doesnt run middleware model methods
//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
       
//         //Update that runs middleware model methods
//         const user = await User.findById(req.params.id)
//         updates.forEach(key=>user[key] = req.body[key])
//         await user.save()

//         if (!user) return resp.status(404).send()
//         return resp.send("User Updated")
//     } catch (e) {
//         resp.status(500).send()
//     }
// })

// UPDATE SELF
router.patch('/users/me', auth, async (req, resp) =>{
    const updates = Object.keys(req.body)
    const allowedParams = Object.keys(User.schema.paths)
    const isValid = updates.every(update=>allowedParams.includes(update))
    if (!isValid) return resp.status(400).send("Some paramaters are not valid")

    try {
        updates.forEach(key=>req.user[key] = req.body[key])
        await req.user.save()

        return resp.send({status: "User Updated", user: req.user})
    } catch (e) {
        resp.status(500).send()
    }
})

//REMOVE USER BY ID
// router.delete('/users/:id', auth, async (req, resp) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user) resp.send("User already removed")
//         const result = await User.countDocuments({})
//         resp.send("Remaining Users: "+result)
//     } catch(e) {
//         resp.status(500).send()
//     }
// })

//REMOVE SELF
router.delete('/users/me', auth, async (req, resp) => {
    try {
        await req.user.remove()
        resp.send("User Removed: "+req.user.name)
    } catch(e) {
        resp.status(500).send()
    }
})


//UPLOAD PROFILE PIC
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatarImage = buffer
    await req.user.save()
    res.send()
}, (error, req, resp, next) => {
    resp.status(400).send({error: error.message})
})

// DELETE PROFILE PIC
router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatarImage = undefined
    await req.user.save()
    res.send()
}, (error, req, resp, next) => {
    resp.status(400).send({error: error.message})
})

// GET PROFILE PIC
// PROVIDING THIS ADDRESS IN THE <IMG> TAG WILL DISPLAY IMAGE
router.get('/users/:id/avatar', async (req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        if (!user) throw new Error()
        res.set('Content-Type','image/jpg')
        res.send(user.avatarImage)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router