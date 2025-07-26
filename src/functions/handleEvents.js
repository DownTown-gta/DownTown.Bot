const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);

        if (file === 'serverlogger.js') {
            const customLogger = require(filePath);
            if (typeof customLogger === 'function') {
                customLogger(client);
                console.log(`✅ Custom Event File Loaded: ${file}`);
            } else {
                console.warn(`⚠️ Failed to load custom logger: ${file} (Not a function)`);
            }
            continue;
        }

        const event = require(filePath);

        if (event.name && typeof event.execute === 'function') {
            client.on(event.name, (...args) => event.execute(...args));
            console.log(`✅ Event Loaded: ${event.name}`);
        } else {
            console.warn(`⚠️ Skipped loading event: ${file} (Missing name or execute function)`);
        }
    }
};
