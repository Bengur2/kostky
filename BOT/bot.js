const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ]
});
const token = process.env.DISCORD_BOT_TOKEN;
const backendUrl = process.env.BACKEND_URL;

let resultsMessageId = null; // Proměnná pro uložení ID zprávy s výsledky

client.on('ready', () => {
    console.log(`Přihlášen jako ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.content.startsWith('!hodit')) {
        const playerName = message.author.username;
        try {
            const response = await axios.post(`${backendUrl}/roll`, { playerName });
            message.channel.send(response.data.message);
            updateResults(message.channel);
        } catch (error) {
            console.error('Chyba při hodu:', error);
            message.channel.send('Nastala chyba při hodu.');
        }
    } else if (message.content.startsWith('!reset')) {
        try {
            const response = await axios.post(`${backendUrl}/reset`);
            message.channel.send(response.data.message);
            updateResults(message.channel);
        } catch (error) {
            console.error('Chyba při resetu:', error);
            message.channel.send('Nastala chyba při resetu.');
        }
    }
});

async function updateResults(channel) {
    try {
        const response = await axios.get(`${backendUrl}/results`);
        let resultsMessage = 'Výsledky:\n';
        response.data.results.forEach(result => {
            let rollsDisplay = result.rolls.length > 0 ? result.rolls.join(', ') : 'Ještě neházel';
            resultsMessage += `${result.name}: ${rollsDisplay}\n`;
        });

        if (resultsMessageId) {
            // Uprav existující zprávu
            try {
                const message = await channel.messages.fetch(resultsMessageId);
                await message.edit(resultsMessage);
            } catch (error) {
                console.error('Chyba při úpravě zprávy:', error);
                // Pokud zpráva neexistuje, pošli novou
                const newMessage = await channel.send(resultsMessage);
                resultsMessageId = newMessage.id;
            }
        } else {
            // Pošli novou zprávu a ulož její ID
            const newMessage = await channel.send(resultsMessage);
            resultsMessageId = newMessage.id;
        }
    } catch (error) {
        console.error('Chyba při načítání výsledků:', error);
        channel.send('Nastala chyba při načítání výsledků.');
    }
}

client.login(token);