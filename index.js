require('dotenv').config();

const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

const bot = new Telegraf(process.env.BOT_TOKEN);

function prettifyMessageText(text) {
    return text.trim().toLowerCase().split(' ');
}

const greetings = new Map([
    ['привет', 'русский'],
    ['hello', 'английский'],
    ['hola', 'испанский']
]);

bot.command('help', ctx => {
    let replyStr = 'Бот может здороваться на разных языках.\nСписок поддерживаемых приветствий:\n';
    for (let [word, lang] of greetings) {
        replyStr += `• ${word} - ${lang}\n`;
    }
    replyStr += ''+
    '\nТакже можно добавить свое приветствие с помощью команды /add.' +
    '\nДля этого введите /add и язык со словом через пробел.' +
    '\nНапример: "/add hello английский".\n';

    replyStr += ''+
        '\nТакже можно удалять приветствия с помощью команды /rm.' +
        '\nДля этого введите /rm и слово для удаления.' +
        '\nНапример: "/rm hello".\n';

    ctx.reply(replyStr);
});

bot.command('add', ctx => {
    const [, key, value] = prettifyMessageText(ctx.update.message.text);

    if (!key || !value) {
        ctx.reply('Неверный  формат данных. Введите слово и язык через пробел.');
        return;
    }

    if(greetings.has(key)) {
        ctx.reply('Такое слово уже есть в словаре!');
        return;
    }

    greetings.set(key, value);
    ctx.reply(`Для языка ${value} успешно добавлено приветствие "${key}."`);
})

bot.command('rm', ctx => {
    const [, word] = prettifyMessageText(ctx.update.message.text);

    if (!word) {
        ctx.reply('Вы не ввели слово для удаления!');
        return;
    }

    ctx.reply(greetings.delete(word) ? `Слово ${word} успешно удалено из словаря.` : `Слово ${word} не найдено.`);
})

bot.hears('Ты красивый', ctx => ctx.reply('Спасибо большое!'));

bot.on(message('text'), ctx => {
    const messageText = ctx.update.message.text;

    const greeting = [...greetings.keys()]
        .find(el => el === messageText.toLowerCase());

    if (!greeting) {
        ctx.reply(`Приветствие "${messageText}" не поддерживается.`);
        return;
    }

    const beautifulGreeting = greeting.slice(0,1).toUpperCase() + greeting.slice(1);

    const { first_name: firstName, last_name: lastName }  = ctx.update.message.from;
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    ctx.reply(`${beautifulGreeting}, ${fullName}!!! :-)`);
});

bot.botInfo = bot.telegram.getMe().then(() => console.log('Bot Started'));
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));