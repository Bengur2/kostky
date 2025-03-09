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

let resultsMessageId = null;
const usersWhoRolled = new Set();
const commandQueue = [];
const processedCommands = new Set();
let isProcessing = false;

client.on('ready', () => {
    console.log(`Přihlášen jako ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    console.log('Zpráva:', message.content, 'od:', message.author.username);

    if (message.content.startsWith('!hodit')) {
        const commandId = `${message.author.id}-${message.id}`;
        commandQueue.push({ playerName: message.author.username, id: commandId, channel: message.channel });
        processCommandQueue();
    } else if (message.content.startsWith('!reset')) {
        usersWhoRolled.clear();
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

async function processCommandQueue() {
    if (isProcessing || commandQueue.length === 0) return;
    isProcessing = true;

    const command = commandQueue.shift();
    if (processedCommands.has(command.id)) {
        console.log(`Příkaz ${command.id} již byl zpracován, přeskočeno.`);
        isProcessing = false;
        processCommandQueue();
        return;
    }

    try {
        const response = await axios.post(`${backendUrl}/roll`, { playerName: command.playerName });
        command.channel.send(response.data.message);
        await updateResults(command.channel);
        processedCommands.add(command.id);
    } catch (error) {
        console.error('Chyba při hodu:', error);
        command.channel.send('Nastala chyba při hodu.');
    } finally {
        setTimeout(() => {
            isProcessing = false;
            processCommandQueue();
        }, 500);
    }
}

async function updateResults(channel) {
    console.log('Volání updateResults');
    console.trace();
    try {
        const response = await axios.get(`${backendUrl}/results`);
        let resultsMessage = 'Výsledky:\n';
        response.data.results.forEach(result => {
            let rollsDisplay = result.rolls.length > 0 ? result.rolls.join(', ') : 'Ještě neházel';
            resultsMessage += `${result.name}: ${rollsDisplay}\n`;
        });

        if (resultsMessageId) {
            try {
                await channel.messages.fetch(resultsMessageId).then(async (oldMessage) => {
                    // Přidání pauzy před mazáním zprávy
                    setTimeout(async () => {
                        await oldMessage.delete();
                    }, 200); // 200 ms pauza (může být upravena)
                }).catch(() => {
                    console.log('Zpráva s výsledky neexistuje, není co mazat.');
                });
            } catch (error) {
                console.error('Chyba při mazání zprávy:', error);
            }
        }

        const newMessage = await channel.send(resultsMessage);
        resultsMessageId = newMessage.id;

    } catch (error) {
        console.error('Chyba při načítání výsledků:', error);
        channel.send('Nastala chyba při načítání výsledků.');
    }
}

client.login(token);