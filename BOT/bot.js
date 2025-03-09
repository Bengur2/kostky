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
const usersWhoRolled = new Set(); // Set pro sledování uživatelů, kteří hodili

client.on('ready', () => {
    console.log(`Přihlášen jako ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    console.log('Zpráva:', message.content, 'od:', message.author.username); // Přidáno logování

    if (message.content.startsWith('!hodit')) {
        const playerName = message.author.username;

        if (usersWhoRolled.has(playerName)) {
            message.channel.send(`${playerName} už hodil.`);
            return; // Ukončí funkci, pokud už uživatel hodil
        }

        usersWhoRolled.add(playerName); // Přidá uživatele do Setu

        console.log('Před voláním axios.post'); // Přidáno logování
        try {
            const response = await axios.post(`${backendUrl}/roll`, { playerName });
            message.channel.send(response.data.message);
            updateResults(message.channel);

            // Simulace hodů botů po hodu bengur3403
            if (playerName === 'bengur3403') {
                setTimeout(() => simulateBotRoll('Bot1', message.channel), 1000);
                setTimeout(() => simulateBotRoll('Bot2', message.channel), 2000);
            }

        } catch (error) {
            console.error('Chyba při hodu:', error);
            message.channel.send('Nastala chyba při hodu.');
        }
        console.log('Po volání axios.post'); // Přidáno logování
    } else if (message.content.startsWith('!reset')) {
        usersWhoRolled.clear(); // Vymaže Set při resetu
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
    console.log('Volání updateResults'); // Přidáno logování
    console.trace(); // Přidáno trasování
    try {
        const response = await axios.get(`${backendUrl}/results`);
        let resultsMessage = 'Výsledky:\n';
        response.data.results.forEach(result => {
            let rollsDisplay = result.rolls.length > 0 ? result.rolls.join(', ') : 'Ještě neházel';
            resultsMessage += `${result.name}: ${rollsDisplay}\n`;
        });

        // Smaže předchozí zprávu s výsledky
        if (resultsMessageId) {
            try {
                // Přidána kontrola existence zprávy
                await channel.messages.fetch(resultsMessageId).then(async (oldMessage) => {
                    await oldMessage.delete();
                }).catch(() => {
                    console.log('Zpráva s výsledky neexistuje, není co mazat.');
                });
            } catch (error) {
                console.error('Chyba při mazání zprávy:', error);
            }
        }

        // Pošle novou zprávu s výsledky a uloží její ID
        const newMessage = await channel.send(resultsMessage);
        resultsMessageId = newMessage.id;

    } catch (error) {
        console.error('Chyba při načítání výsledků:', error);
        channel.send('Nastala chyba při načítání výsledků.');
    }
}

async function simulateBotRoll(botName, channel) {
    try {
        const response = await axios.post(`${backendUrl}/roll`, { playerName: botName });
        channel.send(response.data.message);
        updateResults(channel);
    } catch (error) {
        console.error(`Chyba při hodu bota ${botName}:`, error);
        channel.send(`Nastala