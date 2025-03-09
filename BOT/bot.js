const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ]
});
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
    console.log('--- Nová zpráva ---');
    console.log('ID zprávy:', message.id);
    console.log('ID uživatele:', message.author.id);
    console.log('Obsah zprávy:', message.content);
    console.log('Časové razítko:', message.createdTimestamp);

    if (message.content.startsWith('!hodit')) {
        const commandId = `${message.author.id}-${message.id}`;
        console.log('Přidávám příkaz do fronty:', commandId);
        commandQueue.push({ playerName: message.author.username, id: commandId, channel: message.channel });
        console.log('Aktuální fronta příkazů:', commandQueue);
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
    if (isProcessing || commandQueue.length === 0) {
        console.log('Zpracování fronty: nic k zpracování nebo probíhá jiné zpracování.');
        return;
    }
    isProcessing = true;

    const command = commandQueue.shift();
    console.log('Zpracovávám příkaz:', command.id);
    console.log('Aktuální fronta příkazů po odebrání:', commandQueue);

    if (processedCommands.has(command.id)) {
        console.log(`Příkaz ${command.id} již byl zpracován, přeskočeno.`);
        isProcessing = false;
        processCommandQueue();
        return;
    }

    try {
        if (!await checkServerHealth()) {
            console.error('Server není dostupný, příkaz nebude zpracován.');
            command.channel.send('Server není dostupný, zkuste to později.');
            isProcessing = false;
            processCommandQueue();
            return;
        }
        await axios.post(`${backendUrl}/roll`, { playerName: command.playerName });
        usersWhoRolled.add(command.playerName);
        await updateResults(command.channel);
        processedCommands.add(command.id);
        console.log('Příkaz zpracován, přidávám do zpracovaných:', command.id);
        console.log('Aktuální zpracované příkazy:', processedCommands);
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

        const filteredResults = response.data.results.filter(result => usersWhoRolled.has(result.name));

        filteredResults.forEach(result => {
            let rollsDisplay = result.rolls.length > 0 ? result.rolls.join(', ') : '';
            if (rollsDisplay) {
                resultsMessage += `${result.name}: ${rollsDisplay}\n`;
            }
        });

        if (resultsMessageId) {
            try {
                await channel.messages.fetch(resultsMessageId).then(async (oldMessage) => {
                    setTimeout(async () => {
                        await oldMessage.delete();
                        console.log('Zpráva s výsledky smazána:', resultsMessageId);
                    }, 200);
                }).catch(() => {
                    console.log('Zpráva s výsledky neexistuje, není co mazat.');
                });
            } catch (error) {
                console.error('Chyba při mazání zprávy:', error);
            }
        }

        const newMessage = await channel.send(resultsMessage);
        resultsMessageId = newMessage.id;
        console.log('Nová zpráva s výsledky odeslána:', resultsMessageId);

    } catch (error) {
        console.error('Chyba při načítání výsledků:', error);
        channel.send('Nastala chyba při načítání výsledků.');
    }
}

async function checkServerHealth() {
    try {
        const response = await axios.get(`${backendUrl}/health`);
        return response.data.status === 'ok';
    } catch (error) {
        console.error('Server není dostupný:', error);
        return false;
    }
}

client.login(process.env.DISCORD_TOKEN);