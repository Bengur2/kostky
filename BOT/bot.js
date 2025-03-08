const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });
const token = process.env.DISCORD_BOT_TOKEN;
const backendUrl = process.env.BACKEND_URL;

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
        const playerName = message.author.username;
        if (playerName === 'Master') {
            try {
                const response = await axios.post(`${backendUrl}/reset`, { playerName });
                message.channel.send(response.data.message);
                updateResults(message.channel);
            } catch (error) {
                console.error('Chyba při resetu:', error);
                message.channel.send('Nastala chyba při resetu.');
            }
        } else {
            message.channel.send('Nemáš oprávnění resetovat hody.');
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
        channel.send(resultsMessage);
    } catch (error) {
        console.error('Chyba při načítání výsledků:', error);
        channel.send('Nastala chyba při načítání výsledků.');
    }
}

client.login(token);