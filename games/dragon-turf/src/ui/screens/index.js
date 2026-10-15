import { Screens } from '../screens.js';
import { ComicScreen } from '../comic.js';
import { TitleScreen, HowToScreen } from './title.js';
import { PauseScreen, SettingsScreen } from './pause.js';
import { PdaScreen } from './pda.js';
import { ContactScreen } from './contact.js';
import { GunShopScreen, EateryScreen, HospitalScreen, SprayScreen, ChopScreen, SafehouseScreen } from './shops.js';
import { TradeScreen } from './trade.js';
import { HotwireScreen } from './hotwire.js';
import { EndingScreen } from './ending.js';
import { CheatScreen } from './cheats.js';

// Registers every screen and wires world interactions (POIs) to them.
export function createScreens(game) {
  const s = new Screens(game);
  s.register('comic', ComicScreen); s.register('title', TitleScreen); s.register('howto', HowToScreen); s.register('pause', PauseScreen); s.register('settings', SettingsScreen);
  s.register('pda', PdaScreen); s.register('contact', ContactScreen); s.register('gunshop', GunShopScreen); s.register('eatery', EateryScreen); s.register('hospital', HospitalScreen);
  s.register('spray', SprayScreen); s.register('chop', ChopScreen); s.register('safehouse', SafehouseScreen); s.register('trade', TradeScreen); s.register('hotwire', HotwireScreen); s.register('ending', EndingScreen); s.register('cheats', CheatScreen);
  const I = game.interact;
  I.register('contact', (poi) => s.open('contact', { contact: poi.contact }));
  I.register('shop_gun', () => s.open('gunshop')); I.register('eatery', () => s.open('eatery')); I.register('hospital', () => s.open('hospital'));
  I.register('spray', () => s.open('spray')); I.register('chop', () => s.open('chop')); I.register('safehouse', () => s.open('safehouse'));
  game.minigames = { hotwire: (v) => s.open('hotwire', { vehicle: v }) };
  return s;
}
