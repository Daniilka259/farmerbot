const TOKEN = "8ac697523dd0cb753e477237613a9b475f8ab5da4db30d0a32c0cd112d062973c681a04e30a3bd2036693";
const ID    = 202257406;

const { VK, Keyboard } = require('vk-io');
const vk = new VK();
const commands = [];
const request = require('prequest'); 
const utils = {
    sp: (int) => {
        int = int.toString();
        return int.split('').reverse().join('').match(/[0-9]{1,3}/g).join('.').split('').reverse().join('');
    },
    rn: (int, fixed) => {
        if (int === null) return null;
        if (int === 0) return '0';
        fixed = (!fixed || fixed < 0) ? 0 : fixed;
        let b = (int).toPrecision(2).split('e'),
            k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3),
            c = k < 1 ? int.toFixed(0 + fixed) : (int / Math.pow(10, k * 3) ).toFixed(1 + fixed),
            d = c < 0 ? c : Math.abs(c),
            e = d + ['', 'тыс', 'млн', 'млрд', 'трлн'][k];

            e = e.replace(/e/g, '');
            e = e.replace(/\+/g, '');
            e = e.replace(/Infinity/g, 'ДОХЕРА');

        return e;
    },
    gi: (int) => {
        int = int.toString();

        let text = ``;
        for (let i = 0; i < int.length; i++)
        {
            text += `${int[i]}&#8419;`;
        }

        return text;
    },
    decl: (n, titles) => { return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2] },
    random: (x, y) => {
        return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
    },
    pick: (array) => {
        return array[utils.random(array.length - 1)];
    }
}
let users = require('./users.json');
let buttons = [];

async function saveUsers()
{
    require('fs').writeFileSync('./users.json', JSON.stringify(users, null, '\t'));
    return true;
}
setInterval(async () => {
    await saveUsers();
    console.log('saved');
}, 30000);


vk.setOptions({ token: TOKEN, pollingGroupId: ID });
const { updates, snippets } = vk;

updates.startPolling()
.then(() => {
    console.log(`Бот запущен!
        Создатель - Даниил Кодеров(Лебедев)`);
})
updates.on('message', async (message) => {
    if(Number(message.senderId) <= 0) return;
    if(/\[club169600143\|(.*)\]/i.test(message.text)) message.text = message.text.replace(/\[club169600143\|(.*)\]/ig, '').trim();

    if(!users.find(x=> x.id === message.senderId))
    {
        const [user_info] = await vk.api.users.get({ user_id: message.senderId });
        const date = new Date();

        users.push({
            id: message.senderId,
            uid: users.length,
            balance: 5000,
            regDate: `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`,
            tag: user_info.first_name,
            seno: 0,
            ferms: 1,
            exp: 0,
            level: 0,
            admin: 0
        });
    }

    message.user = users.find(x=> x.id === message.senderId);
    if(message.user.ban) return;

    const bot = (text, params) => {
        return message.send(`${message.user.mention ? `@id${message.user.id} (${message.user.tag})` : `${message.user.tag}`}, ${text}`, params);
    }

    const command = commands.find(x=> x[0].test(message.text));
    if(!command) return;

    if(message.user.exp >= 24)
    {
        message.user.exp = 1;
        message.user.level += 1;
    }

    message.args = message.text.match(command[0]);
    await command[1](message, bot);

    console.log(`Была введена команда: ${message.text}`)
});

const cmd = {
    hear: (p, f) => {
        commands.push([p, f]);
    }
}
cmd.hear(/^(?:помощь|команды|меню|help|commands|cmds|menu|начать|start)$/i, async (message, bot) => {
    await bot(`мои команды:
        ⠀💡 Основные:
        ⠀⠀⠀⠀🧙‍♂ Профиль
        ⠀⠀⠀⠀⠀⠀🐷 О ферме
        ⠀⠀⠀⠀⠀⠀⠀⠀🌻 Продать сено [количество|все]
        ⠀⠀⠀⠀⠀🤝 Передать [id] [сумма]
        ⠀🌻Ферма:
        ⠀⠀⠀⠀🥳 Улучшения
        ⠀⠀⠀⠀⠀⠀🥳 Улучшения [1-9]
        ⠀⠀⠀⠀⠀⠀⠀🌻 Собрать сено

        ⠀🚀 Развлечения:
        ⠀⠀⠀⠀🔦 Сейф [число 10-99]`);
    message.send({keyboard:
        Keyboard.keyboard([
        ([
            Keyboard.textButton({
                label: "Улучшения",
                color: Keyboard.PRIMARY_COLOR
            }),
            Keyboard.textButton({
                label: "Профиль",
                color: Keyboard.PRIMARY_COLOR
            }),
            Keyboard.textButton({
                label: "О ферме",
                color: Keyboard.PRIMARY_COLOR
            })
            Keyboard.textButton({
                label: "Помощь",
                color: Keyboard.PRIMARY_COLOR
            })
            Keyboard.textButton({
                label: "Сбор",
                color: Keyboard.PRIMARY_COLOR
            })
        ])
        ])
    });
});
cmd.hear(/^(?:проф|профиль)$/i, async (message, bot) => {
    await bot(`вот твой профиль:
        ⠀⠀🆔 ID: ${message.user.uid}⠀⠀
        ⠀⠀⠀⠀💰 Деньги: ${utils.sp(message.user.balance)}$
        ⠀⠀⠀⠀⠀⠀🌻 Сено: ${utils.sp(message.user.seno)}
        ⠀⠀⠀⠀⠀⠀⠀⠀🐷 Фермы: ${utils.sp(message.user.ferms)}
        ⠀⠀🔶 Уровень: ${message.user.level}
        ⠀⠀⠀⠀🔷 Exp: ${message.user.exp}
        ⠀⠀
       ⠀⠀⌚ Дата регистрации: ${message.user.regDate}`);
});
cmd.hear(/^(?:о ферме)$/i, async (message, bot) => {
    await bot(`гайд:
        ⠀⠀🌻 Сено ты получаешь за сбор
        ⠀⠀❗ 5 сена за 1 ферму
        ⠀⠀⠀⠀Одно сено стоит 50$`);
});
cmd.hear(/^(?:продать сено)\s(.*)$/i, async (message, bot) => {
    message.args[1] = message.args[1].replace(/(\.|\,)/ig, '');
    message.args[1] = message.args[1].replace(/(к|k)/ig, '000');
    message.args[1] = message.args[1].replace(/(м|m)/ig, '000000');
    message.args[1] = message.args[1].replace(/(все|всё)/ig, message.user.balance);
    if (message.user.seno < message.args[1]){
        await bot('у вас нет столько сена! 😢');
    }
    else {
        message.user.seno -= message.args[1];
        message.user.balance += message.args[1] * 50;
        await bot('вы успешно продали сено! 🛒');
    }
});
cmd.hear(/^(?:сейф)\s([0-9]+)$/i, async (message, bot) => {
    if(message.args[1] < 10 || message.args[1] >= 100) return;

    const int = utils.random(10, 99);
    message.args[1] = Number(message.args[1]);

    if(int === message.args[1])
    {
        message.user.balance += 10000000;
        return bot(`невероятно! Вы угадали число.
        💲 Вам начислено 10.000.000$`);
    } else if(int !== message.args[1])
    {
        return bot(`вы не угадали число. Вам выпало число "${int}"
        🎉 Не отчаивайтесь, количество попыток неограниченно.
        
        Если вы угадаете код, то вы получите 10.000.000$`);
    }
});
cmd.hear(/^(?:выдать)\s(.*)$/i, async (message, bot) => {
    if(message.user.admin < 2) return
    message.args[1] = message.args[1].replace(/(\.|\,)/ig, '');
    message.args[1] = message.args[1].replace(/(к|k)/ig, '000');
    message.args[1] = message.args[1].replace(/(м|m)/ig, '000000');
    message.user.balance += Number(message.args[1]);
    return bot('вы выдали себе ' + utils.sp(message.args[1]) + '$');
});
cmd.hear(/^(?:улучшения|улуч)$/i, async (message, bot) => {
    return bot(`вот все улучшения:
        ⠀Фермеры:
        ⠀⠀1.Фермер[1] - 20.000$
        ⠀⠀⠀⠀2.Фермер[2] - 35.000$
        ⠀⠀⠀⠀⠀3.Фермер[3] - 65.000$
        ⠀Машины:
        ⠀⠀4.Трактор[5] - 125.000$
        ⠀⠀⠀⠀5.Супер трактор[10] - 240.000$
        ⠀⠀⠀⠀⠀6.New Holland T9.670[25] - 470.000$`);
    message.send({keyboard:
        Keyboard.keyboard([
        ([
            Keyboard.textButton({
                label: "Улучшения",
                color: Keyboard.PRIMARY_COLOR
            }),
            Keyboard.textButton({
                label: "Профиль",
                color: Keyboard.PRIMARY_COLOR
            }),
            Keyboard.textButton({
                label: "О ферме",
                color: Keyboard.PRIMARY_COLOR
            })
            Keyboard.textButton({
                label: "Помощь",
                color: Keyboard.PRIMARY_COLOR
            })
            Keyboard.textButton({
                label: "Сбор",
                color: Keyboard.PRIMARY_COLOR
            })
        ])
        ])
    });
});
cmd.hear(/^(?:улучшения|улуч)\s([0-9]+)$/i, async (message, bot) => {
    if(message.args[1] < 1 || message.args[1] >= 7) return;
    if (message.args[1] == 1 && message.user.balance >= 20000){
        message.user.balance -= 20000;
        message.user.ferms += 1;
        return bot('вы купили улучшение!!🥳')
    }
    else if (message.args[1] == 2 && message.user.balance >= 35000){
        message.user.balance -= 35000;
        message.user.ferms += 2;
        return bot('вы купили улучшение!!🥳')
    }
    else if (message.args[1] == 3 && message.user.balance >= 65000){
        message.user.balance -= 65000;
        message.user.ferms += 3;
        return bot('вы купили улучшение!!🥳')
    }
    else if (message.args[1] == 4 && message.user.balance >= 125000){
        message.user.balance -= 125000;
        message.user.ferms += 5;
        return bot('вы купили улучшение!!🥳')
    }
    else if (message.args[1] == 5 && message.user.balance >= 240000){
        message.user.balance -= 240000;
        message.user.ferms += 10;
        return bot('вы купили улучшение!!🥳')
    }
    else if (message.args[1] == 6 && message.user.balance >= 470000){
        message.user.balance -= 470000;
        message.user.ferms += 25;
        return bot('вы купили улучшение!!🥳')
    }
    else {
        return bot('У вас не хватает денег!')
    }
    message.send({keyboard:
        Keyboard.keyboard([
        ([
            Keyboard.textButton({
                label: "Улучшения",
                color: Keyboard.PRIMARY_COLOR
            }),
            Keyboard.textButton({
                label: "Профиль",
                color: Keyboard.PRIMARY_COLOR
            }),
            Keyboard.textButton({
                label: "О ферме",
                color: Keyboard.PRIMARY_COLOR
            })
            Keyboard.textButton({
                label: "Помощь",
                color: Keyboard.PRIMARY_COLOR
            })
            Keyboard.textButton({
                label: "Сбор",
                color: Keyboard.PRIMARY_COLOR
            })
        ])
        ])
    });
});
cmd.hear(/^(?:собрать сено|сбор|собрать)$/i, async (message, bot) => {
    message.user.seno += message.user.ferms;
    await bot('вы успешно поработали и собрали ' + message.user.ferms + ' сена!');
     message.send({keyboard:
        Keyboard.keyboard([
        ([
            Keyboard.textButton({
                label: "Сбор",
                color: Keyboard.PRIMARY_COLOR
            })
        ])
        ])
    });
});
cmd.hear(/^(?:передать)\s([0-9]+)\s(.*)$/i, async (message, bot) => {
    message.args[2] = message.args[2].replace(/(\.|\,)/ig, '');
    message.args[2] = message.args[2].replace(/(к|k)/ig, '000');
    message.args[2] = message.args[2].replace(/(м|m)/ig, '000000');
    message.args[2] = message.args[2].replace(/(вабанк|вобанк|все|всё)/ig, message.user.balance);

    if(!Number(message.args[2])) return;
    message.args[2] = Math.floor(Number(message.args[2]));

    if(message.args[2] <= 0) return;

    if(message.args[2] > message.user.balance) return bot(`недостаточно денег
        ваш баланс: ${utils.sp(message.user.balance)}$`);
    else if(message.args[2] <= message.user.balance)
    {
        let user = users.find(x=> x.uid === Number(message.args[1]));
        if(!user) return bot(`неверный ID игрока`);

        if(user.uid === message.user.uid) return bot(`неверный ID`);

        message.user.balance -= message.args[2];
        user.balance += message.args[2];

        await bot(`вы передали игроку ${user.tag} ${utils.sp(message.args[2])}$`);
        if(user.notifications) vk.api.messages.send({ user_id: user.id, message: `▶ Игрок ${message.user.tag} перевел вам ${utils.sp(message.args[2])}$!` });
    }
});