var TessiBot = {
    
    //Konfigurace
    CONFIG: {
        CHAT_PREFIX: "!",
        ALKOHOL_MSGS: [
        	"na panáka.",
        	"na pivo.",
        	"na Sex on the Beach.",
        	"na rum s colou.",
        	"na Mojito.",
        	"na panáka, ale nakonec musí platit on/a, protože nemá peníze.",
        	"na pivo, ale nakonec musí platit on/a, protože nemá peníze.",
        	"se ztřískat do němoty.",
        	"na chlastačku"
		],
        ASK_MSGS: [
        	"Všechno je možné...",
        	"Co já vím? Nejsem věštec.",
        	"Ano",
        	"Ne",
        	"Zajisté",
        	"Všechno nasvědčuje tomu že ne.",
        	"Všechno nasvědčuje tomu že ano.",
        	"Mno když vezmu v potaz bio zátěž a počet hvězd ve vesmíru... Počkat na co ses to ptal/a?",
        	"To není jisté.",
        	"Možná",
        	"Někteří lidé prostě potřebují obejmout... Okolo krku a provazem! Hlavně ti co se ptají na stupidní otázky. :)",
        	"To netuším.",
        	"To se nedá jednoznačně určit.",
        	"Pokud vím, tak odpověď je ne.",
        	"Pokud vím, tak odpověď je ano."
		],
        COOKIE_MSGS: [
            "sušenku štěstí. Stojí v ní: \"Tessi tě sleduje :eyes:\"",
        	"sušenku štěstí. Stojí v ní: \"Nezapomeň jíst zeleninu.\"",
        	"sušenku štěstí. Stojí v ní: \"Miluju tě. :heart:\"",
        	"sušenku štěstí. Stojí v ní: \"Neměl/a by ses učit nebo pracovat?!\"",
        	"sušenku štěstí. Stojí v ní: \"Vyjímečná sušenka pro vyjímečného člověka. :heart:\"",
            "čokoládovou sušenku.",
            "Oreo sušenku s mlékem.",
            "velkou čokoládovou sušenku, pečenou s láskou. :heart:",
			"jemnou domácí ovesnou sušenku.",
       		"obyčejnou, suchou, starou sušenku, která byla poslední v sáčku. Nevychovanec.",
        	"čokoládovou sušenku. Počkat, jsou na ni rozinky. Blé!",
        	"čerstvé sušenky. Voní báječně.",
        	"kokosové sušenky s čokoládovou polevou.",
        	"modrou sušenku. Počkat?! Sušenka s viagrou!"
        ],
        FACKA_MSGS: [
        	"ti liskl/a!",
        	"ti vrazil/a facku!",
        	"tě profackoval/a!",
        	"tě vyliskal/a!",
        	"ti vrazil/a takovou facku, že jsi druhou chytl/a o zeď!"
		],
		SEX_MSGS: [
        	"chce stebou sex.",
        	"by ti rád/a vymel/a dírky.",
        	"na to chtěl/a skočit, ale on se ne a ne postavit.",
        	"chtěl/a sex, ale usnul/a než na jste to stihli skočit.",
        	"by tě rád/a osexoval/a.",
        	"tě zkoušel/a osexovat, ale běžel/a moc rychle, zakopl/a a jebl/a se o stůl tak tvrdě, že upadl/a do bezvědomí.",
        	"chce odpanit."
		],
		SPAM_MSGS: [
        	"tě jen tak značil.",
        	"tě chce zaspamovat... kashfkhiquwKLVNDKFBGQOFHVNFKUHoalbsurthiakdvjb",
        	"ti rád dělá naschvály.",
        	"ti poslal prostě spam.",
        	"ti vzkazuje: Ať žije spam. :)"
		]
    },
    
    UTIL: {
        getUserByName: function(un) {
            
            return API.getUsers().find(function(e) { return e.username === un; });
        },
        isInWaitList: function(id) {

        	return API.getWaitList().some(function(e) { return e.id == id; });
        }
    },
    
    //Nastavení bota
    start: function() {
        
        var config = TessiBot.CONFIG;
        
        //Events
        API.on(API.CHAT, function(data) {
            
            var cid = data.cid;
            var message = data.message;
            var user = API.getUser(data.uid);
            
            //Správa začíná s prefixem
            if(message.startsWith(config.CHAT_PREFIX)) {
                
                var commands = TessiBot.commands;
                
                //Smazat prefix
                message = message.substring(config.CHAT_PREFIX.length)
                
                //Mazání zprávy
                if(user.id != API.getUser().id)
                	API.moderateDeleteChat(cid);

                //Najít příkaz
                var command_name = message.match(/^(\S+).*/)[1];
                
                if(command_name == null) {
                    
                    API.sendChat("/me [@" + user.username + "] Neplatný příkaz");
                    return false;
                }
                
                var command = Object.keys(commands).find(function(key) {
                    
                    return commands[key].command == command_name;
                });
                
                if(command == null) {
                    
                    API.sendChat("/me [@" + user.username + "] Neexistující příkaz");
                    return false;
                }
                
                command = commands[command];

                //Může použít příkaz
                var userRole = user.role;

                if((command.permission || API.ROLE.NONE) > userRole) {

                	API.sendChat("/me [@" + user.username + "] Pro tento příkaz nemáš dostatečné oprávnění")
                	return false;
                }

                userRole = API.getUser().role;

                if((command.plug_permission || API.ROLE.NONE) > userRole) {

                	API.sendChat("/me [@" + user.username + "] Pro tento příkaz nemá bot dostatečné oprávnění")
                	return false;
                }
                
                //Zavolat příkaz
                command.call(data.uid, message.replace(command.command, "").trim());
            }
        });

        //Historyskip
        API.on(API.ADVANCE, function(data) {
    
    		if(data.media == null)
    			return;

   			var inHistory = API.getHistory().some(function(e) { return e.media.cid == data.media.cid; });

    		if(!inHistory)
    	    	return;
			
			if(API.getUser().role < API.ROLE.BOUNCER)
				return;

        	API.moderateForceSkip();
        	API.sendChat("/me [@" + data.dj.username + "] Tato skladba je již v historii");

        });

        //Po zapnutí napíše, že je online
        API.sendChat("/me TessiBot online!")
    },
    
    //Příkazy
    commands: {
    	add: {
    		name: "Add",
    		command: "add",
    		permission: API.ROLE.BOUNCER,
    		plug_permission: API.ROLE.BOUNCER,
    		call: function(sender_uid, message) {

    			//Získat uživatele
    			var sender = API.getUser(sender_uid);

    			//Získat přidaného do fronty
    			var receiver;

    			//Kontrola fronty
                jQuery.getJSON("https://plug.dj/_/booth", function(data) {

                	var locked = data.data[0].isLocked;

	    			//Ověření
	                if(message == "") {
	                    
	                    receiver = sender;
	                } else {
	                	receiver = TessiBot.UTIL.getUserByName(/^@.*/.test(message) ? message.match(/^@(.*)/)[1] : message);
	                }

	                if(receiver == null) {
	                    
	                    API.sendChat("/me [@" + sender.username + "] Neplatný uživatel");
	                    return false;
	                }

	                if(API.getUser().role == API.ROLE.BOUNCER && locked) {

	                	API.sendChat("/me [@" + sender.username + "] Bot nemá dostatečné oprávnění pro manipulaci se zamčenou frontou")
	                	return false;
	                }

	                if(API.getDJ() != null && API.getDJ().id == receiver.id) {

	                	if(sender.id == receiver.id)
	                		API.sendChat("/me [@" + sender.username + "] Jsi právě DJ")
	                	else
	                		API.sendChat("/me [@" + sender.username + "] Uživatel @" + receiver.username + " je právě DJ");
	                	
	                	return false;
	                }

	                if(TessiBot.UTIL.isInWaitList(receiver.id)) {

	                	API.sendChat("/me [@" + sender.username + "] Uživatel @" + receiver.username + " je již ve frontě");
	                	return false;
	                }

                	//Přidat do fronty
                	if(API.getUser().id == receiver.id)
                		API.djJoin();
                	else
    					API.moderateAddDJ(receiver.id);
                
    				//Odpověď
    				if(sender.id == receiver.id)
    					API.sendChat("/me [@" + sender.username + "] se přidal/a do fronty")
    				else
    					API.sendChat("/me [@" + sender.username + "] přidal/a uživatele @" + receiver.username + " do fronty");
                });
                	
    			return true;
    		}
    	},

    	alkohol: {
            name: "Alkohol",
            command: "alkohol",
            call: function(sender_uid, message) {
                
                //Možnosti odpovědí
                var messages = TessiBot.CONFIG.ALKOHOL_MSGS;
                
                //Získat uživatele
                var sender = API.getUser(sender_uid);
                
                //Vybrání příjemce z příkazu
                var receiver = TessiBot.UTIL.getUserByName(/^@.*/.test(message) ? message.match(/^@(.*)/)[1] : message);
                
                //Ověření
                if(message == "") {
                    
                    API.sendChat("/me [@" + sender.username + "] Pozvi někoho na panáka :smirk:");
                    return false;
                }
                
                if(receiver == null) {
                    
                    API.sendChat("/me [@" + sender.username + "] Neplatný uživatel");
                    return false;
                }
                
                if(sender.id == receiver.id) {
                    
                    API.sendChat("/me [@" + sender.username + "] Nechlastej sám/sama. V kolektivu je to větší zábava! :P");
                    return false;
                }
                
                //Výběr odpovědi
                var message = messages[~~(Math.random() * messages.length)];
                
                //Odeslat zprávu
                API.sendChat("/me [@" + sender.username + "] zve uživatele @" + receiver.username + " " + message);
                return true;
            }
        },

    	ask: {
            name: "Ask",
            command: "ask",
            call: function(sender_uid, message) {

            	//Možnosti odpovědí
            	var answers = TessiBot.CONFIG.ASK_MSGS

            	//Získat uživatele
                var sender = API.getUser(sender_uid);
                
                //Vybrání textu z příkazu
                var question = message;

                //Ověření
                if(message == "") {
                    
                    API.sendChat("/me [@" + sender.username + "] Zeptej se bota na cokoliv. (Otázky typu ano/ne)");
                    return false;
                }

                //Výběr odpovědi
                var message = answers[~~(Math.random() * answers.length)];
                
                //Odeslat zprávu
                API.sendChat("/me [@" + sender.username + "] se zeptal/a: " + question + " Odpověď zní: " + message);
                return true;

            }
        },

        cookie: {
            name: "Cookie",
            command: "cookie",
            call: function(sender_uid, message) {
                
                //Možnosti odpovědí
                var messages = TessiBot.CONFIG.COOKIE_MSGS;
                
                //Získat uživatele
                var sender = API.getUser(sender_uid);
                
                //Vybrání příjemce z příkazu
                var receiver = TessiBot.UTIL.getUserByName(/^@.*/.test(message) ? message.match(/^@(.*)/)[1] : message);
                
                //Ověření
                if(message == "") {
                    
                    API.sendChat("/me [@" + sender.username + "] Pošli někomu sušenku!");
                    return false;
                }
                
                if(receiver == null) {
                    
                    API.sendChat("/me [@" + sender.username + "] Neplatný uživatel");
                    return false;
                }
                
                if(sender.id == receiver.id) {
                    
                    API.sendChat("/me [@" + sender.username + "] Nejsi trochu chamtivý/á? Dávat sušenky sobě. Heh. Rozděl se s ostatními!");
                    return false;
                }
                
                //Výběr odpovědi
                var message = messages[~~(Math.random() * messages.length)];
                
                //Odeslat zprávu
                API.sendChat("/me [@" + sender.username + "] daroval/a uživateli @" + receiver.username + " " + message);
                return true;
            }
        },

        cmd: {
            name: "Command",
            command: "cmd",
            call: function() {
                API.sendChat("/me Příkazy: https://git.io/vbxhL");
            }
        },

        eta: {
        	name: "ETA",
        	command: "eta",
        	call: function(sender_uid) {
                
                var average = 0;
                var history = API.getHistory();
                
                //Sečíst délky písniček v historii
                for(var i = 0; i < history.length; ++i) {
                    average += history[i].media.duration;
                }
                
                //Aritmetický průměr jedné písničky z historie (v sekundách)
                average = average / history.length;

                //Pozice ve frontě
                var position = API.getWaitList().findIndex(function(e) { return e.id == sender_uid; });
                
                //Výpočet pro eta
                var eta = average * position + API.getTimeRemaining();


                //Převod na hodiny, minuty, sekundy
                var hour = ~~(eta / 3600);
                var min = ~~(eta % 3600 / 60);
                var sec  = ~~(eta % 60);

                //Získat uživatele
                var DJ = API.getDJ();
                var user = API.getUser(sender_uid).username;


                //Ověření
                if(DJ != null && DJ.id == sender_uid) {

                	API.sendChat("/me [@" + user + "] Jsi DJ");
                	return false;
                }
                	
                if(position == -1) {

					API.sendChat("/me [@" + user + "] Nejsi ve frontě");
                	return false;
				}

				API.sendChat("/me [@" + user + "] Budeš na řadě za: " + (hour == 0 ? "" : hour + ".") + min + ":" + sec);
				return true;
            }
        },

        facka: {
            name: "Facka",
            command: "facka",
            call: function(sender_uid, message) {
                
                //Možnosti odpovědí
                var messages = TessiBot.CONFIG.FACKA_MSGS;
                
                //Získat uživatele
                var sender = API.getUser(sender_uid);
                
                //Vybrání příjemce z příkazu
                var receiver = TessiBot.UTIL.getUserByName(/^@.*/.test(message) ? message.match(/^@(.*)/)[1] : message);
                
                //Ověření
                if(message == "") {
                    
                    API.sendChat("/me [@" + sender.username + "] Pořádnou někomu flákni!");
                    return false;
                }
                
                if(receiver == null) {
                    
                    API.sendChat("/me [@" + sender.username + "] Neplatný uživatel");
                    return false;
                }
                
                if(sender.id == receiver.id) {
                    
                    API.sendChat("/me [@" + sender.username + "] Přece nebudeš fackovat sám/sama sebe. :)");
                    return false;
                }
                
                //Výběr odpovědi
                var message = messages[~~(Math.random() * messages.length)];
                
                //Odeslat zprávu
                API.sendChat("/me [@" + receiver.username + "] Uživatel @" + sender.username + " " + message);
                return true;
            }
        },
        
        fb: {
            name: "FB",
            command: "fb",
            call: function() {
                API.sendChat("/me Zploditel tohoto bota: https://www.facebook.com/Nerd.Tessi");
            }
        },

        love: {
        	name: "Love",
        	command: "love",
        	call: function(sender_uid, message) {

        		//Získat uživatele
                var sender = API.getUser(sender_uid);
                
                //Vybrání příjemce z příkazu
                var receiver = TessiBot.UTIL.getUserByName(/^@.*/.test(message) ? message.match(/^@(.*)/)[1] : message);

                //Ověření
                if(message == "") {
                    
                    API.sendChat("/me [@" + sender.username + "] Zjisti na kolik % máš někoho rád/a. :heart:");
                    return false;
                }
                
                if(receiver == null) {
                    
                    API.sendChat("/me [@" + sender.username + "] Neplatný uživatel");
                    return false;
                }
                
                if(sender.id == receiver.id) {
                    
                    API.sendChat("/me [@" + sender.username + "] Nesnaž se. Nikdo tě nemá rád, ani ty sám/sama sebe... :broken_heart:");
                    return false;
                }

                if(sender.id == 5477951 && receiver.id == 4183729) {

                	API.sendChat("/me [@" + sender.username + "] miluje uživatele @" + receiver.username + " na 200 % :purple_heart:");
                	return;
                }

                if(sender.id == 4183729 && receiver.id == 5477951) {

                	API.sendChat("/me [@" + sender.username + "] miluje uživatele @" + receiver.username + " na 200 % :green_heart:");
                	return;
                }

                //Vygenerování čísla
                var randomN = Math.floor((Math.random() * 100) + 1);

        		API.sendChat("/me [@" + sender.username + "] miluje uživatele @" + receiver.username + " na " + randomN + " % :heart:");
        	}
        },

        ping: {
            name: "Ping",
            command: "ping",
            call: function() {
                API.sendChat("/me Pong!");
            }
        },

        remove: {
        	name: "Remove",
        	command: "remove",
        	permission: API.ROLE.BOUNCER,
        	plug_permission: API.ROLE.BOUNCER,
        	call: function(sender_uid, message) {

        		//Získat uživatele
    			var sender = API.getUser(sender_uid);

    			//Získat odebraného z fronty
    			var receiver;

    			//Kontrola fronty
                jQuery.getJSON("https://plug.dj/_/booth", function(data) {

                	var locked = data.data[0].isLocked;

    			//Ověření
                if(message == "") {
                    
                    receiver = sender;
                } else {
                	receiver = TessiBot.UTIL.getUserByName(/^@.*/.test(message) ? message.match(/^@(.*)/)[1] : message);
                }

                if(receiver == null) {
                    
                    API.sendChat("/me [@" + sender.username + "] Neplatný uživatel");
                    return false;
                }

                if(API.getUser().role == API.ROLE.BOUNCER && locked) {

	                	API.sendChat("/me [@" + sender.username + "] Bot nemá dostatečné oprávnění pro manipulaci se zamčenou frontou")
	                	return false;
	                }

                if(API.getDJ() != null && API.getDJ().id == receiver.id) {

                	if(sender.id == receiver.id)
                		API.sendChat("/me [@" + sender.username + "] Jsi právě DJ")
                	else
                		API.sendChat("/me [@" + sender.username + "] Uživatel @" + receiver.username + " je právě DJ");
                	
                	return false;
                }

                if(!TessiBot.UTIL.isInWaitList(receiver.id)) {

                	API.sendChat("/me [@" + sender.username + "] Uživatel @" + receiver.username + " není ve frontě");
                	return false;
                }

                	//Přidat odebrat z fronty
                	if(API.getUser().id == receiver.id)
                		API.djLeave();
                	else
    					API.moderateRemoveDJ(receiver.id);
                
    				//Odpověď
    				if(sender.id == receiver.id)
    					API.sendChat("/me [@" + sender.username + "] se odstranil/a fronty")
    				else
    					API.sendChat("/me [@" + sender.username + "] odstranil/a uživatele @" + receiver.username + " z fronty");
                });
                	
    			return true;
        	}
        },

        sex: {
            name: "Sex",
            command: "sex",
            call: function(sender_uid, message) {
                
                //Možnosti odpovědí
                var messages = TessiBot.CONFIG.SEX_MSGS;
                
                //Získat uživatele
                var sender = API.getUser(sender_uid);
                
                //Vybrání příjemce z příkazu
                var receiver = TessiBot.UTIL.getUserByName(/^@.*/.test(message) ? message.match(/^@(.*)/)[1] : message);
                
                //Ověření
                if(message == "") {
                    
                    API.sendChat("/me [@" + sender.username + "] Dáme sex?");
                    return false;
                }
                
                if(receiver == null) {
                    
                    API.sendChat("/me [@" + sender.username + "] Neplatný uživatel");
                    return false;
                }
                
                if(sender.id == receiver.id) {
                    
                    API.sendChat("/me [@" + sender.username + "] Haha chce vosexovat sám/sama sebe, protože by si o něj/ni nikdo ani pevnou linku neopřel!");
                    return false;
                }
                
                //Výběr odpovědi
                var message = messages[~~(Math.random() * messages.length)];
                
                //Odeslat zprávu
                API.sendChat("/me [@" + receiver.username + "] Uživatel @" + sender.username + " " + message);
                return true;
            }
        },

        skip: {
        	name: "Skip",
        	command: "skip",
        	permission: API.ROLE.BOUNCER,
        	plug_permission: API.ROLE.BOUNCER,
        	call: function(sender_uid) {

        		//Získat uživatele
        		var user = API.getUser(sender_uid);

        		//Ověření
        		if(API.getDJ() == null) {
        			API.sendChat("/me [@" + user.username + "] Aktuálně nehraje žádná skladba");
        			return false;
        		}

        		//Přeskočit skladbu
        		API.moderateForceSkip();

        		//Odpověď
        		API.sendChat("/me [@" + user.username + "] Přeskočil/a aktuální skladbu");
        		return true;
        	}
        },

		spam: {
            name: "Spam",
            command: "spam",
            call: function(sender_uid, message) {
                
                //Možnosti odpovědí
                var messages = TessiBot.CONFIG.SPAM_MSGS;

                 //Získat uživatele
                var sender = API.getUser(sender_uid);

                //Vybrání příjemce z příkazu
                var receiver = TessiBot.UTIL.getUserByName(/^@.*/.test(message) ? message.match(/^@(.*)/)[1] : message);

                //Ověření
                if(message == "") {
                    
                    API.sendChat("/me Zaspamuj někoho :smirk:");
                    return false;
                }
                
                if(receiver == null) {
                    
                    API.sendChat("/me Neplatný uživatel");
                    return false;
                }
                
                if(sender.id == receiver.id) {
                    
                    API.sendChat("/me Přece nebudeš spamovat sám/sama sebe. :)");
                    return false;
                }
                
                //Výběr odpovědi
                var message = messages[~~(Math.random() * messages.length)];
                
                //Odeslat zprávu
                API.sendChat("/me [@" + receiver.username + "] Někdo " + message);
                return true;
            }
        }
    }
}
TessiBot.start();
