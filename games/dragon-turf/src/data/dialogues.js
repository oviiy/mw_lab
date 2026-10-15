// Cutscene scripts. side: where the portrait stands; mood: neutral | talk | angry | smile | sad.
const K = (text, mood = 'neutral') => ({ who: 'kai', side: 'left', text, mood });
const W = (text, mood = 'neutral') => ({ who: 'wei', side: 'right', text, mood });
const L = (text, mood = 'neutral') => ({ who: 'lin', side: 'right', text, mood });
const H = (text, mood = 'neutral') => ({ who: 'hu', side: 'right', text, mood });

export const DIALOGUES = {
  arrive: [
    K('Five years abroad. Dragon Street still smells like roast duck, gunpowder and wet neon.'),
    K('Uncle Wei sent word. He never sends word unless somebody is bleeding.', 'sad'),
    { who: 'radio', side: 'right', name: 'Jade Lantern FM', text: '…lanterns go up tonight over Dragon Gate. Lock your shutters early, folks. Somebody always gets lit.' },
  ],

  wei1: [
    W('Ah Kai. You have grown. You also look like your father: stubborn, and underfed.', 'smile'),
    K('Uncle. Your letter said the Serpents were in trouble.'),
    W('Trouble? Hah. The Red Dragons took Lantern Alley, the night market, half the docks. Brother Hu drinks my tea and calls it tribute.', 'angry'),
    W('I need someone Hu does not know. A clean face with dirty hands.'),
    K('What do you need?'),
    W('Wheels. The Chop Shop pays well for black sedans, and one outside belongs to a Dragon. Borrow it. Permanently.'),
    K('Hotwire a car. Like riding a bicycle.', 'smile'),
    W('A bicycle that wakes the whole street if you get it wrong. Go.'),
  ],
  wei2: [
    W('Not a scratch on the paint. Your father would have scratched it on purpose, just to make a point.', 'smile'),
    W('Come see me when you want real work. And Kai, never carry cash through Dragon streets.'),
    K('Then I will carry something that bites back.'),
    W('Good. Guns do not get mugged.'),
  ],

  protect1: [
    W('Every shop on this street pays someone. For years they paid us. Now they pay the Dragons.', 'angry'),
    W('Four shops owe the Serpents their dues. Visit them. Be polite. Be firm. Do not be nice.'),
    K('And if the Dragons are collecting too?'),
    W('Then you collect twice. Once from the shop, once from the Dragon.'),
  ],
  protect_ambush: [
    { who: 'stranger', side: 'right', name: 'Dragon Collector', text: 'Look at this. A little Serpent chick, picking up our change.', mood: 'angry' },
    K('Your change? Funny. I thought it was my uncle\'s.'),
  ],
  protect2: [
    W('Tea. Sit. You are bleeding on my floor, which is rude, but I forgive you.', 'smile'),
    W('You collected, you fought, you came back. That is three more things than most men manage.'),
    W('Madam Lin of the Phoenix Pavilion needs a driver with nerves. Go see her. Be charming.'),
    K('I am always charming.'),
    W('You are always loud. It is not the same.'),
  ],

  lin1: [
    L('So you are the nephew. Kai, was it? Sit, sit. Don\'t touch the porcelain, it\'s worth more than you.', 'smile'),
    L('Tonight is Lantern Night. The whole city will be watching Dragon Gate. I want them watching fireworks, not each other.'),
    K('You want me to steal fireworks.'),
    L('The Iron Tigers hoard a whole truck of them down at Smuggler\'s Pier. Big Tiger Mo thinks fireworks are his birthright.', 'angry'),
    L('Drive that truck to the Dragon Gate arch before the festival begins. Bring it in one piece. Preferably, bring yourself in one piece too.'),
  ],
  lin2: [
    L('Look at them. A thousand faces turned upward. For one minute nobody is thinking about turf.', 'smile'),
    L('That is what I sell, Kai. Not fireworks. Minutes.'),
    K('Then you owe me at least an hour.'),
    L('Flattery already. Your uncle did warn me.', 'smile'),
  ],

  hit1: [
    L('The Black Lotus keep their books in the head of a man named Pang. A very nervous accountant.', 'neutral'),
    L('He hides in a glass tower in Neon Heights, surrounded by people who dislike strangers.'),
    K('Why him?'),
    L('Because when numbers disappear, so do payrolls. And an unpaid army becomes a very small army.'),
    L('Be quick. The alarm will bring the police. They have a rather rigid sense of humour.'),
  ],
  hit2: [
    L('Pang is off the books. Permanently. Orchid will spend a week just finding out what she is owed.', 'smile'),
    L('The Lotus will be furious. Furious people make mistakes, and mistakes make profit.'),
  ],

  war1: [
    W('Lantern Alley. Red Dragon territory, run by a thug who calls himself the Lantern King.', 'angry'),
    W('Take it back, Kai. Walk into the hideout, tell them it is Serpent ground, and make them believe it.'),
    K('How many of them do I have to put down?'),
    W('As many as it takes. When the street sees a Serpent flag again, it remembers who it used to belong to.'),
  ],
  war2: [
    W('Lantern Alley flies green again. You have no idea what that means to the old men playing mahjong there.', 'smile'),
    W('But it also means Hu now knows your face.'),
  ],

  race1: [
    L('The Phoenix Pavilion is sponsoring tonight\'s Midnight Run. Six checkpoints, three rivals, no rules.', 'smile'),
    L('The prize is respect. And a very fine sum of money. Win, and every crew on Dragon Street hears your name.'),
    K('And if I lose?'),
    L('You will learn something. Cheaply.'),
  ],
  race2: [
    L('First across the line, and the Tigers\' boy is still picking glass out of his teeth.', 'smile'),
    K('Tell him to keep the change.', 'smile'),
    L('Ah Kai. By dawn the whole street will be saying your name. Try to make them say it nicely.'),
  ],

  vendetta1: [
    W('The Black Lotus have three captains running protection through the city. Three. I counted them like a man counting his debts.', 'angry'),
    W('I want them gone. No speeches. No mercy. Hit them one at a time, before they learn to expect you.'),
    K('And the Lotus boss?'),
    W('Madam Orchid is a polite woman. She will send flowers to your funeral. Do not give her the opportunity.'),
  ],
  vendetta2: [
    W('Three captains down. The Lotus are quiet. Quiet is the sound of an enemy counting its wounds.', 'smile'),
    W('Which means it is time to go after the dragon itself.'),
  ],

  final1: [
    W('Brother Hu has locked himself inside the Dragon Gate hideout. Armed men on every floor. Bulletproof glass. A very expensive sense of self-importance.', 'angry'),
    K('How many Serpents will ride with me?'),
    W('You are the Serpents, Kai. The rest of us are only watching from the windows.'),
    W('End this. Make Dragon Street breathe again.'),
  ],
  final_hu: [
    H('You. The ghost Wei dug up. I should have burned your father\'s tea shop to the ground twice.', 'angry'),
    K('Third time lucky?'),
    H('Come then, boy. Let us see how green you bleed.', 'angry'),
  ],
  final2: [
    W('It is quiet. I did not think I would live to hear it that quiet.', 'sad'),
    W('Dragon Street is yours now, nephew. Or ours, if you are generous.'),
    K('Ours. Always ours.', 'smile'),
    { who: 'radio', side: 'right', name: 'Jade Lantern FM', text: 'Tonight the lanterns burn green over Dragon Gate. For those who just joined: welcome home.' },
  ],

  tigers1: [W('Kai. Iron Tigers outside, nine of them, carrying furniture they intend to break.', 'angry'), K('I just got here.'), W('Then make a strong first impression.')],
  tigers2: [W('The chairs survived. The Tigers did not. Tea?', 'smile')],
  boat1: [L('A crate of jade must cross the harbour before the coastguard finishes breakfast.', 'smile'), L('Red boat, marina. Go fast, Kai. Faster than that.')],
  boat2: [L('Wet, but on time. I can forgive wet.', 'smile')],
  plane1: [L('The Black Lotus float their goods in on old junks. Wooden boats, Kai. Very flammable.'), K('You want me to set the harbour on fire.'), L('From above, darling. Fort Jade has a stunt plane nobody is using.', 'smile')],
  plane2: [L('Three junks, three bonfires. Orchid will be counting splinters for a week.', 'smile')],
  tank1: [W('The Dragons move rifles in armoured vans now. Bullets bounce off.', 'angry'), K('So I need something bigger.'), W('There is a tank at Fort Jade. Your father once stole a ferry. This is family tradition.')],
  tank2: [W('The street is saying a tank went down Lantern Alley. The street is not wrong.', 'smile')],
  heli1: [W('Big Tiger Mo is meeting his captains in the Smokestack Yards. They watch the roads.'), K('Then I will not use the roads.', 'smile')],
  heli2: [W('The Tigers will remember to look up now. Too late for Mo.', 'smile')],
  heist1: [L('The Lotus pay their soldiers from a golden armoured truck. Tonight it carries a month of wages.'), L('Bring it to the chop shop. The police will be... enthusiastic.')],
  heist2: [L('The Lotus soldiers will not be paid this month. Unpaid soldiers find new employers.', 'smile'), K('Like us.'), L('Like us.')],

  taxi: [
    { who: 'stranger', side: 'right', text: 'You, driver. Take me where the lights are brightest and the questions are fewest.' },
  ],
};
