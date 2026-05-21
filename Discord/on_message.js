const { Client } = require("@notionhq/client");

// Initializing a client
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})
const databaseId = process.env.NOTION_DATABASE_ID


module.exports = async (client, message) => {
    if (!message.author.bot) {
        console.log(message.channel.id)
        if (message.channel.id == '1370075834496454667' || message.channel.id == '1234714381640532001') {
            if (message.content.startsWith('ts ')) {
                message.content = message.content.slice(3);
                if (message.content.length > 0) {
                    command(client, message);
                }
            }
        }
    };
}

async function command(client, message) {
    if (message.content.startsWith('verify')) {
        token = message.content.slice(7);
        console.log(token)
        if (token.length < 36) {
            await message.react('❌');
            await sendMessage(message,'Please use a valid token.');
            await message.delete();
            return;
        }
        var response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                and: [
                    {
                        "property": 'Discord Secret',
                        "rich_text": {
                            "contains": token
                        }
                    }
                ]
            }
        });
        console.log(JSON.parse(JSON.stringify(response)));
        console.log(response.results[0].properties)
        if (!response.results.length > 0) {
            await message.react('❌');
            await sendMessage(message, 'Invalid token.');
            await message.delete();
            return;
        }
        var properties = (await response.results[0].properties);
        console.log(properties.Name.rich_text[0].text.content + ' | ' + properties.Grade.rich_text[0].text.content + properties.Section.rich_text[0].text.content)
        // console.log(properties)
        try {
            await message.member.setNickname(properties.Name.rich_text[0].text.content + ' | ' + properties.Grade.rich_text[0].text.content + properties.Section.rich_text[0].text.content);
        } catch (error) {
            console.log(error)
        }
        await sendMessage(message, 'You are verified!');
        let role = await message.guild.roles.cache.find(r => r.name == 'participant')
        await message.react('✅');
        await message.member.roles.add(role);
        await message.delete();
        for(let i = 0 ;i < properties.Fields.multi_select.length;i++){
            let name = properties.Fields.multi_select[i].name
            if(name == "UI Design"){
                let role = await message.guild.roles.cache.find(r => r.name == 'ui/ux')
                await message.member.roles.add(role);
            }
            else if(name == "App Development"){
                let role = await message.guild.roles.cache.find(r => r.name == 'appD')
                await message.member.roles.add(role);
            }
            else if(name == "Web Development"){
                let role = await message.guild.roles.cache.find(r => r.name == 'webD')
                await message.member.roles.add(role);
            }
            else if(name == "Game Development"){
                let role = await message.guild.roles.cache.find(r => r.name == 'gamedev')
                await message.member.roles.add(role);
            }
            else if(name == "Encryptid | Cryptic Hunt X CTF"){
                let role = await message.guild.roles.cache.find(r => r.name == 'encryptid')
                await message.member.roles.add(role);
            }
            else if(name == "A/V Editing"){
                let role = await message.guild.roles.cache.find(r => r.name == 'av')
                await message.member.roles.add(role);
            }
            else if(name == "2D Design"){
                let role = await message.guild.roles.cache.find(r => r.name == '2d')
                await message.member.roles.add(role);
            }
            else if(name == "3D Design"){
                let role = await message.guild.roles.cache.find(r => r.name == '3d')
                await message.member.roles.add(role);
            }
            else if(name == "Group Discussion"){
                let role = await message.guild.roles.cache.find(r => r.name == 'gd')
                await message.member.roles.add(role);
            }
            else if(name == "Competitive Programming"){
                let role = await message.guild.roles.cache.find(r => r.name == 'prog')
                await message.member.roles.add(role);
            }
            else if(name == "Cubing"){
                let role = await message.guild.roles.cache.find(r => r.name == 'cubing')
                await message.member.roles.add(role);
            }
            else if(name == "Film Making"){
                let role = await message.guild.roles.cache.find(r => r.name == 'film')
                await message.member.roles.add(role);
            }
            else if(name == "Crossword"){
                let role = await message.guild.roles.cache.find(r => r.name == 'cross')
                await message.member.roles.add(role);
            }
            else if(name == "Gaming"){
                let role = await message.guild.roles.cache.find(r => r.name == 'gaming')
                await message.member.roles.add(role);
            }
            else if(name == "Photography"){
                let role = await message.guild.roles.cache.find(r => r.name == 'photography')
                await message.member.roles.add(role);
            }
            else if(name == "Hardware"){
                let role = await message.guild.roles.cache.find(r => r.name == 'hardware')
                await message.member.roles.add(role);
            }
            else if(name == "Quiz"){
                let role = await message.guild.roles.cache.find(r => r.name == 'quiz')
                await message.member.roles.add(role);
            }
        }   
    }
}

async function sendMessage(message, content) {
    new Promise(async(resolve, reject) => {
        try {
            await message.author.send(content);
            resolve();
        }
        catch (error) {
            await message.channel.send("You have disabled DMs from server members. Please enable them and resend verification code.");
            resolve();
        }
    })
}