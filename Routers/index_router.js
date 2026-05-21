//Express
const express = require("express");
const IndexRouter = express.Router();
const ejs = require("ejs");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { v4: uuidv4 } = require('uuid');
const { Client } = require("@notionhq/client")
const nodemailer = require('nodemailer');

// Initializing a client
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})
const databaseId = process.env.NOTION_DATABASE_ID

const events = [[
    "App Development",
    "Web Development",
    "Game Development",
    "Encryptid | Cryptic Hunt X CTF"
], ["3D Design",
    "2D Design",
    "UI Design",
    "A/V editing",
], [    "Group Discussion",
    "Crossword",
    "Gaming",
    "Photography"
], [
    "Competitive Programming",
    "Film Making",
    "Hardware",
    "Cubing 2 by 2",
], [
    "Cubing 3 by 3"]
];

IndexRouter.get("/", (req, res) => {
    // res.redirect('https://www.techsyndicate.us/tg')
    // res.render("index", { events }); // iska frontend access sirf netlify wali site se kr
    res.render('email', { age: 14, dis_token:"lmfao", name:"hello" , selected:['helo',  'helo'] })
});

// Transport To Send Mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    secureConnection: false,
    port: 465,
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD // naturally, replace both with your real credentials or an application-specific password
    }, tls: {
        rejectUnauthorized: false
    }
});

IndexRouter.post('/register', async (req, res) => {
    var { name, dob, email, phone, adno, grade, section, selected, parentemail } = await req.body;

    if (!(name && dob && email && phone && adno && grade && section && selected && parentemail)) {
        return res.status(400).send(JSON.stringify({"error":"Please fill all the fields"}));
    }
    if (new Date(dob).getFullYear() < 2000) {
        return res.status(400).send("Please enter a valid date of birth");
    }
    if (phone.length != 10) {
        return res.status(400).send("Please enter a valid phone number");
    }
    // email regex
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(email) || !re.test(parentemail)) {
        return res.status(400).send("Please enter a valid email");
    }
    if (adno.length < 4) {
        return res.status(400).send("Please enter a valid admission number");
    }
    if (grade < 1 || grade > 12) {
        return res.status(400).send("Please enter a valid class");
    }
    //check if user already exists
    const { results } = await notion.databases.query({
        database_id: databaseId,
        filter: {
            "and": [{
                "property": "Email",
                "rich_text": {
                    "equals": email
                }
            }],
        }
    })
    if (results.length > 0) {
        return res.send({
            success: false,
            msg: "User with this email already exists!"
        })
    }

    const dis_token = uuidv4();

    await addItem(name, dob, email, phone, adno, grade, section, selected, dis_token, parentemail);

    const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: email,
        subject: 'InTech Registration Details',
        html: await renderFile('./views/email.ejs', { age: getAge(new Date(dob.toString())), dis_token, name , selected })
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.send({ success: false, error });
        } else {
            res.send({ success: true, msg: 'email-send', info });
        }
    });
});

function getAge(birthDate) {
    var now = new Date();

    function isLeap(year) {
        return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    }

    // days since the birthdate    
    var days = Math.floor((now.getTime() - birthDate.getTime()) / 1000 / 60 / 60 / 24);
    var age = 0;
    // iterate the years
    for (var y = birthDate.getFullYear(); y <= now.getFullYear(); y++) {
        var daysInYear = isLeap(y) ? 366 : 365;
        if (days >= daysInYear) {
            days -= daysInYear;
            age++;
            // increment the age only if there are available enough days for the year.
        }
    }
    return age;
}

const renderFile = (file, data) => {
    return new Promise(resolve => {
        ejs.renderFile(file, data, (err, result) => {
            if (err) {
                logger.error(err);
            }
            resolve(result);
        });
    });
}

async function addItem(name, dob, email, phone, adno, grade, section, selected, dis_token, parentemail) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                "Name": {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": { "content": name }
                        }
                    ]
                },
                "Email": {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": { "content": email }
                        }
                    ]
                },
                "Parent Email": {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": { "content": parentemail }
                        }
                    ]
                },
                "Phone": {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": { "content": phone }
                        }
                    ]
                },
                "Admission Number": {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": { "content": adno }
                        }
                    ]
                },
                "DOB": {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": { "content": dob }
                        }
                    ]
                },
                "Grade": {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": { "content": grade }
                        }
                    ]
                },
                "Section": {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": { "content": section }
                        }
                    ]
                },
                "Fields": {
                    "type": "multi_select",
                    "multi_select":
                        selected.map(x => {
                            return {
                                "name": x
                            }
                        })
                },
                "Discord Secret": {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": { "content": dis_token }
                        }
                    ]
                }
            },
        })
        return response;
    } catch (error) {
        return error;
    }
}

module.exports = IndexRouter;
