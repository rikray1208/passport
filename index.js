const puppeteer = require('puppeteer')
const TelegramApi = require('node-telegram-bot-api')

const url = "https://registration.mfa.gov.ua/qmaticwebbooking/rest/schedule/branches/5a78cad444c63e9ad53b3f14e4049dd60c73c591361544be919e9689c4472dc3/dates;servicePublicId=fefb5cc92eb4b9ad650af55cfd9d9dedf60a32d9ed5b8a5a5ad1442031fd36d5;customSlotLength=10";

const token = '5590903934:AAEYm6DxNrOMPC4O1U6-9xoCIZZrmujuNUY';
const bot = new TelegramApi(token, {polling: true});

const scrape = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.goto(url)
    let innerText = await page.evaluate(() => {
        return JSON.parse(document.querySelector("body").innerText);
    });

    await browser.close()
    return innerText
}

async function main() {
    bot.setMyCommands([
        {command: '/start', description: 'start'},

    ])
    let n = 0;

    bot.on('message', async msg => {
        const chatId = msg.chat.id;

         let timerId = setInterval(async () => {
             const result = await scrape();
             console.log(result);
             console.log(n += 1);

             if (result.length > 0) {
                 await bot.sendMessage(chatId, 'свободные даты на:');

                 result.forEach(element => {
                     bot.sendMessage(chatId, element.date);
                 })

                 clearInterval(timerId);
                 n = 0;
             }
         }, 5000)
    })
}


main()







