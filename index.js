/**
 * A Bot for Slack!
 */


var mcgonagallQuotes = [
    "Potter, take Weasley with you. He looks far too happy over there.",
    "Why is it, when something happens, it is always you three?",
    "Mr. Davis! Mr. Davis, that is the girls' lavatory.",
    "Why don't you confer with Mr. Finnigan? As I recall, he has a particular proclivity for pyrotechnics.",
    "Do nothing? Offer him up as bait? Potter is a boy! Not a piece of meat!",
    "I've always wanted to use that spell.",
    "We teachers are rather good at magic, you know.",
    "Don’t tell me what I can and can’t do, Potter.",
    "Move along now.",
    "Ten thousand points to Gryffindor!",
    "Mraow!",
    "Five points... will be awarded to each of you. For sheer dumb luck.",
    "Perhaps it would be more useful if I were to transfigure Mr Potter and yourself into a pocket watch? That way, one of you might be on time.",
    "This boy will be famous. There won't be a child in our world who doesn't know his name.",
    "Alastor, we never use transfiguration as a punishment. Surely Dumbledore told you that?",
    "The house of Godric Gryffindor has commanded the respect of the wizarding world for nearly ten centuries. I will not have you, in one night, besmirching that name by behaving like a babbling, bumbling band of baboons!",
    "Inside every girl is a swan, waiting to burst out in flight.",
];



/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}


/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

controller.hears(['tom', 'riddle', 'voldemort'], 'direct_message', function (bot, message) {
    bot.reply(message, "If he tries to enroll, please go ahead and let him, but display a message on the screen saying `RED ALERT!!! HE WHO MUST NOT BE NAMED!!!`");
});

controller.hears(['tom', 'riddle', 'voldemort'], 'direct_mention', function (bot, message) {
    bot.reply(message, "Oh, dear, don't ask me about that in a public channel. Please send me a direct message instead!");
});

controller.hears('', 'direct_mention,direct_message', function (bot, message) {
    var responsePossibilities = mcgonagallQuotes;
    var response = responsePossibilities[Math.floor(Math.random() * responsePossibilities.length)];
    bot.reply(message, response);
});


/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
//controller.on('direct_message,mention,direct_mention', function (bot, message) {
//    bot.api.reactions.add({
//        timestamp: message.ts,
//        channel: message.channel,
//        name: 'robot_face',
//    }, function (err) {
//        if (err) {
//            console.log(err)
//        }
//        bot.reply(message, 'I heard you loud and clear boss.');
//    });
//});
