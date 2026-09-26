// Word lists for the generator. Each entry is one lowercase word with no
// spaces or hyphens; multi-word names are run together ("minastirith").
// Diacritics are kept here and folded away at generation time unless the
// "keep accents" option is on. Duplicates across lists are removed when the
// pool is built, so entropy is always computed on the real unique count.
//
// `inflect: 'noun'` lists also yield plurals and `inflect: 'verb'` lists yield
// -s and -ing forms (see `forms`, used when "Plurals & -ing forms" is on).
// `also` holds words that join the list but are never inflected.
// ---- inflection ------------------------------------------------------------

function plural(w) {
  if (IRREGULAR_PLURALS[w]) return IRREGULAR_PLURALS[w]
  if (UNCOUNTABLE.has(w) || /s$/.test(w)) return null
  if (/(ch|sh|x|z)$/.test(w)) return w + 'es'
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies'
  return w + 's'
}

function verbForms(w) {
  const third = /(ch|sh|x|z|s)$/.test(w) ? w + 'es'
    : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies'
    : w + 's'
  // One-syllable consonant-vowel-consonant verbs, a few stressed on the last
  // syllable, and (as in Tolkien's British spelling) verbs ending in a single
  // vowel + l double their final consonant: stopping, forgetting, travelled.
  const doubles = DOUBLE_FINAL.has(w) || /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(w) ||
    /[^aeiou][aeiou]l$/.test(w)   // British: travelling, signalled, quarrelled
  let ing, past
  if (w === 'singe') ing = 'singeing'
  else if (/[^aeiou]ic$/.test(w)) ing = w + 'king'
  else if (/ie$/.test(w)) ing = w.slice(0, -2) + 'ying'
  else if (/(ee|ye|oe)$/.test(w)) ing = w + 'ing'
  else if (/e$/.test(w)) ing = w.slice(0, -1) + 'ing'
  else if (doubles) ing = w + w.slice(-1) + 'ing'
  else ing = w + 'ing'
  if (IRREGULAR_VERBS.has(w)) past = null
  else if (/[^aeiou]ic$/.test(w)) past = w + 'ked'
  else if (/e$/.test(w)) past = w + 'd'
  else if (/[^aeiou]y$/.test(w)) past = w.slice(0, -1) + 'ied'
  else if (doubles) past = w + w.slice(-1) + 'ed'
  else past = w + 'ed'
  return [third, ing, past].filter(Boolean)
}

const DOUBLE_FINAL = new Set(`
  forget begin admit commit compel defer equip forbid permit prefer rebel regret repel
  befit patrol control occur expel propel worship
`.trim().split(/\s+/))

// Verbs whose past tense is not -ed; their real past forms live in `also`.
const IRREGULAR_VERBS = new Set(`
  arise awake bear beat become begin bend beseech bet bid bind bite bleed blow break breed bring
  build burst buy cast catch choose cling come creep cut deal dig do draw drink drive dwell eat fall
  feed feel fight find flee fling fly forbid foresee foretell forget forgive forsake freeze get give
  go grind grow hang hear hide hit hold hurt keep kneel know lay lead leave lend let lie light lose
  make mean meet overcome overhear overtake overthrow pay put read rend rid ride ring rise run say
  see seek sell send set shake shear shed shine shoot shrink shut sing sink sit slay sleep slide
  sling slink slit smite speak speed spend spin spit split spread spring stand steal stick sting
  stink stride strike string strive swear sweep swim swing take teach tear tell think throw thrust
  tread undo uphold wake wear weave weep win wind withdraw withhold withstand wring write befall
  beget fell smith repay
`.trim().split(/\s+/))

const IRREGULAR_PLURALS = {
  wolf: 'wolves', knife: 'knives', loaf: 'loaves', calf: 'calves', hoof: 'hooves',
  scarf: 'scarves', shelf: 'shelves', wife: 'wives', life: 'lives', thief: 'thieves',
  mouse: 'mice', goose: 'geese', tooth: 'teeth', foot: 'feet', man: 'men',
  woman: 'women', child: 'children', fungus: 'fungi', staff: 'staves', half: 'halves',
  sheaf: 'sheaves', elf: 'elves', dwarf: 'dwarves', leaf: 'leaves'
}

const UNCOUNTABLE = new Set(`
  sand gravel shingle scree mist fog haze steam dew rime hoarfrost sleet hail
  drizzle gloom darkness sunlight daylight sunshine starshine moss grass bracken
  heather ling gorse furze broom turf sward ivy clover mint sage thyme rosemary
  parsley chervil fennel dill lavender tansy yarrow meadowsweet heartsease
  kingsfoil nightshade hemlock mistletoe sheep deer swine kine cattle fish trout
  salmon pike perch carp gold copper iron bronze brass tin lead steel flint
  granite marble slate basalt obsidian jet amber coral adamant ore soot foam surf
  spray brine flotsam barley wheat rye hay straw stubble mould sap resin timber
  kindling brushwood deadwood driftwood noon noonday midnight gloaming eventide
  sundown daybreak thaw elk
  bread butter cheese cream milk honey jam jelly marmalade mustard salt pepper
  sugar flour grain meal beer mead wine cider perry brandy porridge gruel broth
  soup pottage bacon ham pork mutton beef venison chicken tobacco lace hose dust
  soap tinder snuff crockery cutlery music merriment revelry fare kin firewood
  gardening potting candlelight firelight lamplight garlic lettuce
  armour armor mail chainmail cavalry infantry bloodshed carnage slaughter havoc
  rubble chivalry fealty allegiance homage booty loot plunder pitch blood poison
  venom relief tribute
`.trim().split(/\s+/))

const LEXICON = [
  {
    id: 'folk',
    name: 'Folk',
    hint: 'Heroes, kings, wizards and villains',
    on: true,
    words: `
      frodo samwise meriadoc peregrin bilbo gandalf aragorn legolas gimli boromir
      faramir éowyn éomer théoden théodred elrond arwen galadriel celeborn glorfindel
      haldir rúmil orophin treebeard quickbeam radagast saruman sauron gollum sméagol
      déagol denethor imrahil beregond bergil gamling háma gríma erkenbrand elfhelm
      bombadil goldberry butterbur barliman hamfast gaffer rosie lobelia lotho fredegar
      folco maggot sandyman ferny shagrat gorbag grishnákh uglúk lugdush mauhúr bard
      beorn smaug elros eärendil elwing beren lúthien túrin tuor idril húrin morgoth
      melkor fëanor fingolfin finarfin finrod fingon turgon maedhros maglor celegorm
      curufin caranthir thingol melian círdan gilgalad isildur elendil anárion
      celebrimbor ungoliant shelob glaurung ancalagon huan carcharoth varda elbereth
      manwë ulmo aulë yavanna oromë nienna tulkas mandos irmo estë vairë nessa vána
      ossë uinen gothmog thranduil elladan elrohir celebrían gilraen arathorn halbarad
      ioreth hirgon eorl fréaláf thengel mithrandir olórin incanus greyhame elessar
      estel strider thorongil telcontar envinyatar angbor duinhir forlong hirluin
      bungo belladonna drogo primula otho gerontius isengrim paladin eglantine pippin
      merry odo holman gildor gwaihir landroval meneldor thorondor goldwine elfwine
      aldor brytta walda fengel folca ghânburighân nob bob beleg mablung saeros
      gwindor finduilas nienor morwen niënor rían huor hador bëor barahir andreth
      amandil tarmeneldur ardamir anborn damrod mardil eärnur ecthelion
    `
  },
  {
    id: 'realms',
    name: 'Realms',
    hint: 'Lands, rivers, cities and mountains',
    on: true,
    words: `
      shire hobbiton bywater bree buckland crickhollow micheldelving tuckborough
      bagend bagshot rivendell imladris moria khazaddûm lothlórien lórien
      carasgaladhon isengard orthanc rohan edoras meduseld hornburg helmsdeep gondor
      minastirith osgiliath ithilien hennethannûn mordor baraddûr orodruin amarth
      mountdoom cirithungol minasmorgul minasithil minasanor udûn gorgoroth anduin
      argonath rauros emynmuil nindalf fangorn mirkwood greenwood erebor dale
      esgaroth weathertop amonsûl fornost arnor annúminas eriador lindon mithlond
      valinor númenor tirion beleriand gondolin nargothrond doriath angband
      thangorodrim belegost nogrod dunharrow dimholt pelargir dolamroth lebennin
      lossarnach anórien enedwaith dunland withywindle baranduin brandywine gladden
      celebrant nimrodel silverlode zirakzigil celebdil caradhras fanuidhol
      mirrormere dimrill carndûm angmar rhûn harad umbar khand eregion hollin
      hithaeglir amonhen amonlhaw parthgalen cairandros erech calembel tharbad
      sarnford greyflood gwathló mitheithel bruinen hoarwell loudwater trollshaws
      ettenmoors northdowns longbottom frogmorton waymeet whitfurrows brockenborings
      overhill needlehole greenholm tookland marish bucklebury staddle combe archet
      chetwood midgewater rammas pelennor mindolluin halifirien calenhad eilenach
      drúadan nurn núrnen lithlad morannon isenmouthe durthang dagorlad sarngebir
      limlight entwash onodló eastemnet westemnet deeping aglarond snowbourn
      harrowdale starkhorn dwimorberg methedras nancurunír ironhills carrock
      dolguldur rhosgobel brownlands valmar valimar alqualondë avallónë eressëa
      taniquetil oiolossë pelóri calacirya aman westmarch eastfarthing southfarthing
      michel greyhavens forochel himring hithlum dorthonion nevrast brethil
      tolsirion taurnufuin anfauglith ossiriand thargelion nanelmoth
    `
  },
  {
    id: 'elvish',
    name: 'Elvish',
    hint: 'Sindarin and Quenya words',
    on: true,
    words: `
      mellon pedo minno ennyn aran galadh ithildin elen síla lúmenn omentielvo
      namárië aiya elenion ancalima gilthoniel lembas miruvor athelas mallorn elanor
      niphredil alfirin simbelmynë palantír silmaril ithil anor isil anar calen morn
      galad naur edraith ammen noro lim daro tolo lasto beth lammen gurth goth yrch
      glamhoth govannen hannon amdir hithlain ered emyn amon dol taur lond forod
      annûn dagor nirnaeth tinúviel yéni únótimë laurië lantar lassi súrinen
      rómello oiolossëo tintallë elentári alda alcar amar anga arda atar calma cirya
      coron elda ellon elleth fëa gil hröa ilmen lassë laurë lótë lúmë macil menel
      mír ohtar ondo orco parma quendi sindë silmë taurë telco tinco tindómë úrë vala
      vanya vilya wilwarin yavië nenya narya mithril galadhrim hîr hiril aglar
      aerlinn ninglor cormallen eglerio andúril anglachel gurthang narsil ringil
      aeglos dagnir estolad celeb mith glîn gwath hîth lhûg mor nar naith rath sarn
      thâl thand tinu tol uial ungol valaraukar ilúvatar eru ainulindalë
      quenta silmarillion ambarona hrívë coirë lairë nárië
    `
  },
  {
    id: 'dwarvish',
    name: 'Dwarvish',
    hint: 'Khuzdul and the houses of the Dwarves',
    on: true,
    words: `
      khazad baruk aimênu zirak zigil kibil nâla kheled zâram azanul bizar gabil
      gathol mahal felak gundu felakgundu sharbhund bundushathûr barazinbar
      tumunzahar gabilgathol ibun mîm khîm narvi azaghâl mazarbul uzbad khuzdul
      tharkûn sigin tarâg durin balin dwalin fíli kíli dori nori ori óin glóin bifur
      bofur bombur thorin thráin thrór dáin fundin farin borin frerin dís gróin flói
      frár lóni náli telchar grór náin nár longbeard ironfist stiffbeard blacklock
      stonefoot broadbeam firebeard oakenshield arkenstone mattock pickaxe delving
      mithril forge anvil bellows chisel
    `
  },
  {
    id: 'relics',
    name: 'Relics',
    hint: 'Rings, blades, steeds and provisions',
    on: true,
    words: `
      ring nenya vilya narya sting andúril narsil glamdring orcrist palantír
      silmaril arkenstone elessar evenstar phial lembas miruvor athelas pipeweed
      longbottomleaf oldtoby mathom elevenses fireworks telperion laurelin nimloth
      whitetree herugrim guthwinë grond dramborleg elendilmir nauglamír dragonhelm
      entdraught cram coney taters seedcake waybread shadowfax hasufel arod brego
      snowmane windfola firefoot stybba roheryn nahar felaróf lumpkin mearas
      redbook thainsbook hornofgondor mithrilcoat elvenrope leafbrooch morgulknife
      barrowblade westernesse silverlode lampwright hobbitpipe greenstone
      starglass
    `
  },
  {
    id: 'creatures',
    name: 'Peoples',
    hint: 'Races, beasts and fell things',
    on: true,
    words: `
      hobbit halfling elf elves dwarf dwarves ent entwife entmoot huorn orc uruk
      urukhai goblin troll olog warg balrog nazgûl ringwraith wight barrowwight
      fellbeast oliphaunt mûmak eagle beorning woses drúedain crebain watcher spider
      dragon wizard istari ranger rohirrim corsair haradrim easterling dunlending
      stoor fallohide harfoot ainur valar maiar eldar noldor sindar teleri vanyar
      avari edain dúnedain eorlingas periannath galadhrim nandor laiquendi
      hillman snowtroll cavetroll stonetroll hilltroll halforc werewolf vampire
      kraken wolfrider gorcrow thrush raven
    `
  },
  {
    id: 'westron',
    name: 'Westron',
    hint: 'The common tongue of the tales',
    on: true,
    words: `
      fellowship journey quest shadow flame ember hammer stone gate door star moon
      sun tree leaf river ford hill barrow tower crown helm shield sword spear bow
      arrow horn banner road path stair bridge deep mine vein gem jewel rune lore
      song tale oath doom hope fate king queen steward rider wanderer burglar smial
      pipe ale mushroom garden lantern candle hearth kettle pantry cellar larder
      waistcoat buttons handkerchief umbrella walkingstick map riddle dark grey white
      silver golden ancient elder mighty weary hidden secret lonely lost last first
      breakfast luncheon supper tea cake tater pony pack rope cloak brooch mountain
      snow pass cavern cave hall chasm abyss whip dawn dusk twilight starlight
      moonlight north south east west wind rain storm thunder lightning ice frost
      fire water earth wood forest marsh fen moor down vale glen heath bog mound
      cairn ruin watchtower beacon errand council heir throne sceptre eored mark
      riddermark marshal shieldmaiden esquire guard warden captain herald messenger
      scout thain shirriff bounder mayor tween eleventy birthday party feast
      ballad verse lay rhyme wizardry spell staff wand sorcery smoke ring
      halls kingdom realm city fortress keep wall rampart gatehouse citadel spire
      beard boots hood bag pocket key lock hinge threshold archway pillar
      moonrise sunrise nightfall harvest yule midsummer lithe blotmath halimath
      rethe thrimidge foreyule afteryule winterfilth solmath astron forelithe
      afterlithe wedmath hobbitry hospitality mischief courage mercy pity loyalty
      friendship wisdom valour glory sorrow grief laughter memory rumour counsel
      wayfarer traveller pilgrim exile outlaw hunter archer lancer spearman
      horseman swordsman smith mason miller farmer gardener cook innkeeper
      ferryman boatman shipwright lamplighter bellringer scribe loremaster
      wanderlust homesick hobbithole brandybuck took baggins gamgee proudfoot
      bracegirdle chubb grubb burrows boffin bolger sackville hornblower cotton
      tunnelly underhill goodbody brockhouse
    `
  },
  {
    id: 'wilds',
    inflect: 'noun',
    name: 'Wilds',
    hint: 'Land, water, weather, trees, herbs, beasts and birds',
    on: true,
    words: `
      mountain peak crag cliff ridge spur slope scree boulder rock stone pebble
      shingle gravel sand dune shore strand beach bay cove inlet firth estuary delta
      marsh swamp fen bog mire quagmire morass slough mere pool pond lake tarn loch
      spring fountain stream brook rill rivulet beck burn creek river torrent
      cataract waterfall falls rapids eddy whirlpool current ford shallows weir
      island isle islet eyot holm reef headland cape promontory peninsula downs
      wold heath moor moorland upland highland lowland valley vale dale dell dingle
      glen combe hollow gully ravine gorge chasm cleft rift fissure crevasse canyon
      pass saddle col notch gap defile cave cavern grotto den lair burrow tunnel
      warren barrow mound hillock knoll hill hilltop brow crest summit pinnacle
      needle tooth fang tor outcrop ledge shelf terrace bank dyke ditch hedge
      hedgerow thicket copse coppice spinney grove woodland forest wildwood holt
      weald brake brush bracken briar bramble thorn gorse furze broom heather ling
      fern moss lichen reed rush sedge bulrush grass turf sward meadow lea pasture
      field paddock orchard glade clearing lawn verge wayside track trail footpath
      bridleway causeway highway lane byway crossroads milestone waymark cairn
      monolith henge ruin oak ash elm beech birch alder willow poplar aspen hazel
      holly yew rowan hawthorn blackthorn elder linden lime chestnut sycamore maple
      pine fir spruce larch cedar cypress juniper laurel myrtle olive fig apple pear
      plum cherry quince medlar walnut sloe crabapple rose lily daisy buttercup
      bluebell primrose cowslip violet pansy poppy cornflower foxglove honeysuckle
      ivy woodbine clover thistle nettle dock dandelion celandine campion yarrow
      tansy mint sage thyme rosemary parsley chervil fennel dill lavender marigold
      snapdragon tulip snowdrop crocus daffodil lilac jasmine hyacinth iris
      waterlily lotus heartsease meadowsweet kingsfoil toadstool puffball truffle
      fungus mould root tuber bulb seed acorn beechnut hazelnut catkin blossom bloom
      bud petal frond twig branch bough limb trunk bark sap resin stump log timber
      kindling brushwood deadwood driftwood sky heaven cloud mist fog haze vapour
      steam dew rime hoarfrost icicle snowflake sleet hail drizzle shower downpour
      deluge tempest gale gust breeze zephyr whirlwind thunderbolt rainbow sunset
      sundown daybreak morning noon noonday afternoon evening eventide gloaming
      midnight darkness gloom shade sunlight daylight sunbeam moonbeam comet meteor
      planet constellation sickle wain summer autumn winter solstice equinox
      thaw horse mare stallion colt foal steed charger palfrey hound dog wolf fox
      badger otter weasel stoat ferret beaver hare rabbit squirrel hedgehog mole
      vole mouse rat bat deer stag hart hind roe fawn elk boar sow pig hog swine
      goat sheep ram ewe lamb cow bull calf heifer cattle kine bear lion leopard
      ape camel adder snake serpent worm wyrm drake toad frog newt lizard eft fish
      trout salmon pike perch eel carp minnow crab hawk falcon kestrel owl crow
      rook jackdaw magpie jay starling blackbird robin wren sparrow finch linnet
      lark nightingale swallow swift martin kingfisher heron crane stork swan goose
      duck mallard gull tern cormorant petrel albatross dove pigeon pheasant
      partridge grouse quail woodpecker cuckoo curlew plover lapwing snipe
      sandpiper bee wasp hornet fly midge gnat moth butterfly beetle ant cricket
      grasshopper glowworm firefly dragonfly gold copper iron bronze brass tin lead
      steel flint granite marble slate basalt obsidian jet amber pearl diamond
      ruby emerald sapphire topaz beryl opal garnet amethyst crystal quartz agate
      onyx jasper coral adamant ore lode nugget cinder ashes soot embers
      puddle ripple wave billow surf spray foam tide flood flotsam brine
      sunshine starshine nightshade hemlock mandrake mistletoe
      barley wheat oats rye hay straw stubble furrow foxhole
    `
  },
  {
    id: 'hearth',
    inflect: 'noun',
    name: 'Hearth',
    hint: 'Hobbit home life: food, drink, clothes, tools and trades',
    on: true,
    words: `
      home house hole burrow cottage hut hovel cabin lodge inn tavern alehouse
      hostel mill farm farmstead homestead barn byre stable shed loft attic cellar
      pantry larder buttery kitchen scullery parlour study library bedroom nursery
      hallway passage porch doorstep doorway window shutter sill chimney fireplace
      grate mantel mantelpiece stove oven pot pan skillet cauldron ladle spoon fork
      knife plate dish bowl cup mug tankard flagon jug pitcher bottle flask barrel
      cask keg tub bucket pail basket hamper sack chest trunk box coffer drawer
      cupboard dresser wardrobe table chair stool bench settle couch bed pillow
      bolster blanket quilt sheet coverlet rug carpet mat curtain lamp candlestick
      taper wick tinderbox clock hourglass mirror picture portrait chart book
      scroll parchment paper ink quill pen letter note invitation present gift
      parcel trinket keepsake heirloom treasure bread loaf crust roll bun scone
      muffin biscuit teacake plumcake pie tart pastry pudding dumpling porridge
      gruel broth soup stew pottage sausage bacon ham pork mutton beef venison
      chicken egg cheese butter cream milk honey jam jelly marmalade preserves
      pickles mustard salt pepper spice sugar flour grain meal beans peas carrots
      turnips potatoes cabbage onion leek garlic radish lettuce cucumber berries
      strawberry raspberry blackberry gooseberry currant elderberry raisin nut
      almond dinner lunch snack banquet picnic ration provisions victuals fare
      beer mead wine cider perry cordial brandy coat cape mantle cap hat bonnet
      scarf shawl muffler jacket jerkin tunic shirt doublet vest breeches trousers
      hose stockings socks shoes slippers sandals clogs gloves mittens belt
      girdle buckle apron smock frock gown dress skirt petticoat ribbon lace pin
      clasp necklace bracelet locket pendant spectacles cane tobacco pouch purse
      wallet tongs chisel saw axe hatchet adze plane drill awl file rasp spade
      shovel hoe rake scythe sickle plough harrow cart wagon waggon wheelbarrow
      sledge ladder cord string twine thread needle thimble loom spindle distaff
      wheel shuttle pulley lever wedge nail peg rivet latch bolt padlock baker
      brewer butcher potter blacksmith tinker tailor weaver cobbler cooper
      carpenter joiner thatcher shepherd cowherd swineherd goatherd ploughman
      reaper gleaner forester woodman woodcutter trapper fisherman carter carrier
      postman clerk sheriff constable watchman landlord dance music fiddle harp
      flute drum bell game conkers quoits darts skittles bowls cards dice chess
      story jest joke prank merriment revelry holiday festival fair market
      neighbour cousin uncle aunt nephew niece grandfather grandmother father mother
      son daughter brother sister husband wife children family kin kinsman
      relatives guest host visitor stranger lodger tenant gentleman gentlehobbit
      lady master mistress servant lad lass youngster teapot teacup saucer
      crockery cutlery napkin tablecloth doily washtub mangle soap towel bathtub
      washstand bedpost footstool armchair bookcase hatstand doorbell bellpull
      knocker doormat keyhole cobweb dust mop duster firewood woodpile hearthrug
      fender poker coalscuttle pipeful smokering snuff matchbox tinder
      candlelight firelight lamplight gardening vegetables flowerbed potting
      seedling marrows pumpkins sunflower hollyhock beehive henhouse dovecote
      pigsty cowshed haystack hayloft granary
    `
  },
  {
    id: 'battle',
    inflect: 'noun',
    name: 'Battle',
    hint: 'Arms, armour, sieges, ships, heraldry and ranks',
    on: true,
    words: `
      war battle fight fray skirmish siege assault attack charge onslaught ambush
      raid foray sortie rout retreat flight victory triumph defeat surrender truce
      parley treaty alliance muster host army legion company troop band squad
      regiment vanguard rearguard van flank wing column line rank file shieldwall
      phalanx cavalry infantry archers bowmen spearmen swordsmen riders horsemen
      knights soldiers warriors guards sentries sentinels scouts outriders heralds
      captains marshals lords generals chieftains champions heroes veterans
      recruits blade brand glaive falchion scimitar sabre rapier dagger dirk
      poniard battleaxe mace club cudgel warhammer flail morningstar lance pike
      javelin dart halberd bill trident longbow crossbow shaft bolt quiver
      bowstring sling buckler targe helmet visor coif hauberk mail chainmail byrnie
      corslet cuirass breastplate gorget greaves vambrace gauntlet armour armor
      scabbard sheath hilt pommel crossguard quillon edge point standard pennant
      pennon flag ensign emblem device badge sigil token seal signet trumpet bugle
      fort castle keep turret bastion battlement parapet walls portcullis
      drawbridge moat postern barbican stronghold hold redoubt outpost garrison
      camp encampment trench palisade stockade ram catapult trebuchet mangonel
      ballista engine scaling pitch torch ship boat vessel barge raft skiff coracle
      ferry galley warship sail mast oar rudder keel prow stern deck hull harbour
      haven quay wharf dock anchor saddle bridle rein stirrup spur bit halter
      harness girth mane hoof horseshoe gallop canter trot prince princess regent
      thane earl duke lieutenant sergeant squire page knight chieftain chief
      counsellor councillor ambassador envoy emissary wound scar blood gash bruise
      arrowhead poison venom warcry warhorn warband warlord warrior swordsman
      shieldbearer spearhead battlefield warpath bloodshed carnage slaughter havoc
      rubble breach bulwark buttress embrasure arrowslit loophole sally
      sallyport vigil watchfire signalfire beacons chivalry fealty
      allegiance homage tribute ransom plunder spoils booty loot hoard trophy
      captive prisoner hostage thrall traitor spy deserter mercenary
      reinforcements relief rescue stand holdfast onset clash
    `
  },
  {
    id: 'lore',
    name: 'Lore',
    hint: 'Magic, fate, song, time, and old words: ere, yonder, wroth',
    on: true,
    words: `
      magic enchantment spell charm curse destiny fortune chance luck despair
      valour honour pride wrath rage fury malice hatred envy greed power might
      strength knowledge learning remembrance oblivion forgetfulness sleep dream
      vision foresight prophecy omen portent sign wonder marvel mystery runes
      letters tengwar cirth lay hymn lament dirge elegy chant legend myth history
      chronicle annals account record light spirit soul heart mind will thought
      deed word vow promise pledge bond debt grace kindness love faith trust
      betrayal treachery deceit lie truth justice judgement law rule dominion
      age era epoch year season month week day hour moment eternity forever ever
      never once yore yesteryear beginning ending end world earth sea ocean void
      firmament ere hither thither yonder whither hence thence whence anon aye
      nay yea thee thou thy thine hath doth wast wert shalt art methinks mayhap
      perchance haply alas behold hark wherefore nigh afar erst erstwhile oft
      seldom betimes whilst amidst amid athwart beyond beneath betwixt fain lief
      wroth fey fell dread doughty stalwart wight weird wont bane boon woe weal
      bliss dole ruth rue kith errant yeoman carl churl swain maid maiden damsel
      bairn crone hag witch warlock seer sage mage enchanter necromancer sorcerer
      counsel debate test trial ordeal voyage pilgrimage expedition adventure
      venture wandering exile homecoming farewell parting meeting greeting welcome
      death grave tomb ghost spectre phantom wraith revenant undead corpse bones
      skull doomsday dayspring evenfall mirth sorrowing heartache longing
      yearning starfire moonfire westward eastward northward southward homeward
      seaward skyward heavenward underworld overseas undersea timeless deathless
      endless nameless faceless shapeless sleepless restless hopeless fearless
      ruthless tireless peerless matchless starless moonless sunless lordship
      kingship stewardship hardship kinship freedom thraldom earldom halidom
      gladness sadness brightness greatness weariness loneliness stillness
      wilderness blessedness remnant relic memorial monument lineage ancestry
      heritage birthright inheritance elvenhome greenwood wayfaring starward
    `
  },
  {
    id: 'deeds',
    inflect: 'verb',
    name: 'Deeds',
    hint: 'Verbs of the road and the fight',
    on: true,
    words: `
      walk wander roam stray tramp trudge plod march stride stroll ramble climb
      clamber scramble descend ascend delve dig tunnel mine forge smith carve hew
      cleave split chop fell hack slash thrust parry strike smite slay kill fight
      defend guard ward protect save rescue flee escape hide lurk skulk creep sneak
      steal pilfer burgle rob seize grasp clutch hold keep carry bear bring fetch
      lift heave haul drag pull push throw hurl cast fling shoot aim loose nock
      draw sheathe unsheathe ride swim wade row paddle drift float sink drown dive
      leap jump bound vault run race dash hurry hasten rush speed stumble fall
      tumble trip slip slide glide soar hover swoop circle perch nest rest slumber
      doze nap wake rise stand sit kneel bow recline sprawl eat drink sup dine feast
      munch nibble gnaw chew swallow gulp quaff brew bake cook roast boil fry toast
      smoke puff blow breathe sigh gasp pant cough sneeze laugh smile grin chuckle
      giggle weep sob wail mourn grieve sing hum whistle recite speak say tell talk
      whisper murmur mutter mumble shout call hail cheer roar bellow howl growl
      snarl hiss shriek scream yell groan moan answer ask beg plead pray bless
      swear betray deceive trick cheat bargain trade buy sell barter give take lend
      borrow share gather glean reap sow plant grow tend weed water prune thresh
      grind knead spin weave knit sew mend darn patch dye paint write read sign
      open shut close lock unlock knock enter leave depart arrive return come
      follow lead guide seek search find lose forget remember recall ponder muse
      wish fear doubt dare risk brave endure suffer persevere strive toil labour
      work wait watch look see gaze stare peer glimpse spy notice listen hear heed
      obey command govern reign anoint heal cure nurse comfort console rouse stir
      kindle burn blaze flicker smoulder quench douse freeze melt shine gleam
      glitter glint glow shimmer sparkle twinkle glisten flash
abandon abide accept accuse ache achieve acquire admire admit adorn advance advise afflict agree
alight allow alter amaze amble amuse anger announce annoy appear applaud appoint approach argue
arise arm arouse arrange array assail assemble assent assist astonish attack attempt attend avenge
avoid await awaken bait balance banish bark batter bathe battle beat beckon befall befriend begin
behave belch believe belong bend beseech besiege bestow bewail bewilder bid bind bite blacken blame
blare blast bleat bleed blend blind blink block bloom blossom blot blunder blur blush board boast
bolt boom border bother bounce brace brag braid brandish brawl bray break brighten bristle broil
brood browse bruise brush bubble buckle budge build bulge bump bundle burrow burst bury bustle
button buzz cackle calm camp canter capture care caress carol carouse catch caution cease chafe
challenge change chant charge charm chase chatter check cherish chide chill chip choke choose
chortle clamour clang clap clash clasp clatter claw clean clear cling clink clip cloak clog cluck
clump cluster coax coil collapse collect comb combat commend compel complain conceal concern
condemn confess confound conjure conquer consent consider contend contrive converse convey cool
cope copy corner count court cover covet cower crack crackle cradle cram crane crash crave crawl
creak crease crinkle croak crook cross crouch crow crowd crown crumble crumple crunch crush curl
curtsy cushion dabble dally damage dampen dance dangle darken dart daunt dawdle dawn daze dazzle
deal decay decide deck declare decline decree deem deepen defeat defer defy delay delight deliver
demand deny depend deploy deserve desire despise destroy detect devise devour dim dip direct
disappear discover disguise dislike dismay dismount dispatch dispel display dispute dissolve
distrust disturb dither divide dodge doom dote drain drape dread dream dress dribble drill drip
drive droop drop drowse drum duck dust dwell dwindle earn ease echo edge elude embark embrace
emerge employ empty enchant encircle encourage end engage engrave enjoy enrage enslave ensnare
entangle entice entreat envy equip erect err escort establish esteem evade examine exceed
exchange excite exclaim excuse exhaust exile expect explain explore expose extend fade fail faint
falter fan fancy fashion fasten fatten favour feed feel fence fend ferry fester fetter fidget
figure fill finish fire fish fit fix flail flap flare flatter flinch flit flock flog flood
flounder flourish flow flutter foam foil fold fool forbid force ford foresee foretell forgive
forsake fortify foster fray free fret frighten frolic frown fumble fume furl gabble gain gallop
gamble gape garnish gild gird glare glance gloat glory glower goad gobble gossip grab grant
grapple graze greet grip groom grope grouse grumble grunt guess gush halt hammer hamper handle
hang happen harass harbour harden hark harm harness harry harvest hatch haunt hazard heap hearten
heat help herd hesitate hinder hint hire hitch hoard hobble hoist holler honour hook hoot hop
hope hound huddle hug hunch hunger hunt hurtle hurt hush hustle idle ignite imagine imitate
imprison incline inform inherit injure inquire insist inspect inspire instruct insult intend
intrude invade invent invite irk jab jangle jeer jerk jest jingle jog join joke jolt jostle
journey judge juggle jumble kick kiss lace lack lament land languish lap lash last launch lay
lean learn lick lie lighten limp linger live load loathe lodge long loom lope lounge love lower
lug lull lumber lunge lure madden maim make manage mar marvel mask master mean measure meddle meet
menace mention merit mind mingle miss mix mock moor mope mount move mow muddle muffle muster nag
name need nestle nod nudge number nurture object oblige observe obtain occupy offend offer oil
ooze oppose order overcome overhear overlook overtake overthrow overturn owe own pace pack pad
pale parade pardon part pass pause pave pay peck peel peep perceive perish permit persuade pester
pick pierce pine pinch pitch pity place plague plait plan play please pledge plot plough pluck
plunder plunge ply poach point poise poke polish pore portend possess post pound pour pout praise
prance preach prefer prepare preserve press pretend prevail prevent prick proclaim prod profit
promise prompt prop prosper prowl pry punish purr pursue quail quake quarrel quell question
quicken quiver rage raid raise rake rally range rankle ransack rap rattle rave reach rebel rebuke
receive reckon recover redeem reel refuse regain regard regret reject rejoice relate relent rely
remain remark remove rend render renew repair repay repeat repel repent reply report repose resent
resist resolve respect respond restore retire retreat reveal revel revenge revere revive reward
rid ring rinse rip ripen roll romp rot rove rub ruin rule rumble rummage rumple rustle sack sadden
sail salute sample sap saunter savour scald scale scamper scan scare scatter scent scoff scold
scorch scorn scour scowl scrape scratch scrawl screech scrub scurry scuttle seal secure seem sense
serve settle shake shape shatter shave shear shed shelter shift shirk shiver shock shove shovel
shrink shrivel shrug shudder shuffle shun sicken sift signal silence simmer singe sip skip skim
slake slam slap sleep slink slit slog slouch slump slurp smash smear smell smother smudge snap
snatch sniff snigger snip snooze snore snort snub soak soften soothe sort sound spare spark
spatter spawn spear speckle spell spend spike spill spit splash splinter spoil sponge sport spot
spout spray spread sprint sprout spur spurn squabble squat squeak squeal squeeze squint squirm
stab stagger stain stake stalk stall stammer stamp startle starve stash stay steady steer stem
step stew stick stifle sting stink stitch stock stomp stoop stop store storm stow straddle
straighten strain strand strangle strap stream strengthen stretch strew strip stroke struggle
strut stub study stuff stun sulk summon supply support suppose surge surprise surrender surround
survey survive suspect sustain swagger swap sway sweep swell swerve swing swipe swirl swoon tackle
tame tangle tap taste taunt teach tease tempt tether thank thin think thirst thrash threaten
thrive throb throng thump thwart tickle tidy tie tilt tingle tinker tip tire toddle topple toss
totter touch tow trace track train trample travel traverse tread treasure treat tremble trim
trouble try tuck tug turn twirl twist twitch unbind unbolt uncover undo unfold unfurl unite
unleash unravel unroll unwrap uphold urge use utter vanish vanquish vex visit wag wager waken
wallow wane want warm warn wash waste wave waver weaken weigh welcome wheel wheeze whimper whine
whip whirl whisk whittle widen wield win wince wind wink wipe wither withdraw withhold withstand
wobble wonder woo worry worship wound wrap wreck wrench wrest wrestle wriggle wring wrinkle yawn
yearn yelp yield
    `,
    also: `
      rode smote slew
      strode fled fought sought found wrought bade spake forsook wove sang rang
      flung clung hung spun won bore swore tore wore strove drove wrote smitten
      forsaken fallen broken sworn hidden stolen woven frozen chosen risen driven
      ridden written spoken awoken forgotten begotten trodden beholden
      journeyed wandered ventured marched climbed delved forged carved hewed
      guarded warded rescued escaped lurked crept sneaked burgled seized carried
      fetched hurled feasted brewed baked roasted puffed laughed wept mourned
      whispered shouted howled pleaded blessed cursed bargained gathered reaped
      sowed mended remembered pondered wondered dreamed hoped feared dared
      endured toiled watched gazed listened heeded healed kindled blazed
      gleamed glittered glowed shimmered sparkled twinkled
arose began bent bit bled blew broke bred brought built bought caught chose clung came crept dealt
dug did drew drank drove dwelt ate fed felt forbade forgot forgave froze got gave went ground grew
heard hid held knelt knew laid led left lent lit lost made meant met paid ran said saw sold sent
shook shone shot showed shrank sank sat slept slid slung slunk spoke sped spent spat sprang stood
stole stuck stung stank struck strung swept swam swung took taught told thought threw trod woke
wept wound wrung arisen beaten begun bitten blown chosen done drawn drunk eaten flown forbidden
forgiven given gone grown known lain seen shaken shorn shown shrunk sung sunk slain sprung
striven swum taken torn thrown withdrawn withheld withstood overcame overheard overtook overthrew
upheld undid undone foresaw foretold besought befell repaid
    `
  },
  {
    id: 'qualities',
    name: 'Qualities',
    hint: 'Colours, moods and the look of things',
    on: true,
    words: `
      old young aged hoary gray black dim pale fair bright shining gleaming silvern
      argent blue azure red crimson scarlet russet brown tawny umber ochre
      yellow orange purple rosy pink ashen sable dusky swarthy big small great
      little tall short long high low wide broad narrow shallow thick thin fat
      lean stout slim slender heavy good bad evil wicked foul vile cruel grim dire
      dreadful terrible fearful awful dreary dismal bleak barren desolate lone
      forlorn silent quiet still calm peaceful gentle kind kindly merry
      jolly cheerful glad happy joyful blithe sad sorrowful mournful woeful tired
      sleepy hungry thirsty greedy generous hospitable respectable queer odd
      peculiar strange curious nosy bold valiant hardy sturdy strong puissant weak
      frail feeble timid shy wary cautious careful careless reckless rash hasty
      quick fleet slow sluggish nimble agile clumsy wise foolish clever cunning sly
      crafty wily shrewd learned noble royal regal lordly kingly queenly proud
      humble lowly meek common rustic homely simple plain rich poor wealthy needy
      cold chill chilly icy frosty hot warm fiery burning smoky misty foggy
      cloudy rainy stormy windy snowy sunny starry moonlit shadowy shady gloomy
      murky sunlit leafy wooded grassy mossy rocky stony sandy muddy marshy boggy
      hilly craggy rugged steep sheer jagged sharp keen blunt dull smooth rough
      soft hard fresh stale sweet sour bitter salty savoury tasty ripe rotten holy
      hallowed sacred haunted enchanted elven dwarven hobbitish mannish orcish
      wizardly magical eldritch free bound captive whole hale sound sick wounded
      dying dead undying immortal mortal far near distant remote outer inner upper
      lower farther further second third single double twin hundred thousand
      sombre solemn stern wistful weary hopeful faithful ageless grievous ghastly
      ghostly deadly lonely lovely lively stately comely courtly knightly princely
      saintly unearthly shadowed hooded cloaked armoured mailed helmed crowned
      sceptred robed bearded grizzled wrinkled weathered battered tattered ragged
      worn glittering shimmering flickering smouldering blazing flaming roaming
      marching riding singing weeping laughing whispering gilded silvered
      jewelled carven hewn graven
able absent abundant accursed afraid airy alert alive aloof ample angry anxious ardent arid ashamed
austere awake awkward balmy bare bashful beastly beloved benign bland blank bleary blissful bloody
blotchy boastful bony bountiful brackish brash brawny brazen breathless brief brilliant brisk
brittle bulky burly busy calloused candid carefree ceaseless charred cheeky cherished chief civil
clammy clean clear close coarse colossal constant cosy cramped creaky crisp crooked crude crumbling
crusty curly damp dainty dank daring dauntless dazed dear decent deep deft dense devout dewy dingy
dirty dizzy docile drab draughty dreamy drowsy dry dusty eager earnest earthy easy eerie elated
elegant eminent empty enormous entire envious epic equal errant eternal even exact faded faint
faithless false famous famished fanciful fateful fatal fertile festive fickle fierce filthy fine
firm fitful flat fleeting flimsy fluffy fond forgotten fragile fragrant frank frantic fretful
friendly frightful frigid frisky frugal fruitful full furious fussy futile gallant gaunt giddy
gifted glassy gleeful glorious glossy glum gnarled gracious grand grateful grave greasy grimy
gritty groggy gruff grumpy guilty gusty hairy handsome handy harsh hazy healthy hearty heavenly
hefty helpful hollow homeless honest horrid hostile huge humid hurried husky idle ill immense
impish innocent intent jaunty jealous jovial joyous juicy jumpy just knobbly knotted lame lanky
large lavish lawful lazy leaden legendary lengthy lethal level light limber limp liquid lithe livid
lofty loose loud loving loyal lucid lucky lumpy lush majestic mangy marvellous massive meagre
mellow menacing messy mild milky mindful minor mirthful miserable modest moist moody motley
muddled muffled musty mute nasty natural neat needful nervous noisy numb oaken obedient obscure
obstinate ominous open orderly ornate painful paltry parched patient peaceable perilous perfect
pert petty pious placid plucky plump plush pointed polished portly potent precious prickly prim
prime prudent puny pure quaint radiant rancid rapid rare raw ready restful rigid robust rowdy rude
rueful rusty safe sane savage scaly scant scarce scared scrawny scruffy sedate serene shabby shaggy
shapely shiny shoddy shrill silky silly sinister skilful skinny sleek slight slimy slippery sloppy
smug snug sober sodden soggy solid sooty sore spare sparse speedy spicy spiky spindly spirited
splendid spotless spry squalid squat staid stark starving steady steely sticky stiff stingy stocky
stuffy stunted subtle sudden sullen sultry sunken superb supple surly sweaty swollen tame tangled
tart taut tender tense thankful thorny thoughtful thrifty tidy tight tiny tough tragic tranquil
tremendous trim trusty ugly uncanny uneasy unholy unruly untidy upright urgent useful useless
vacant vague vain vast velvet venomous vicious vigilant vigorous vivid wakeful wan warlike wasteful
watchful watery weird wet whimsical wild wilful windswept winsome wiry witty wonderful wooden
woolly worthy wretched wry zealous
    `
  },
  {
    id: 'speech',
    name: 'Common Speech',
    hint: 'Everyday words the tales are told in',
    on: true,
    words: `
      head face brow forehead eye eyes eyebrow eyelid lash ear nose nostril mouth
      lip lips tongue teeth jaw chin cheek neck throat shoulder arm elbow wrist
      hand hands palm finger fingers thumb knuckle nail fist chest breast back
      spine rib ribs belly stomach waist hip thigh knee shin calf ankle heel toe
      toes foot feet sole skin flesh bone vein sinew muscle hair curl curls lock
      tress beard whisker whiskers moustache pate scalp crown temple nape
      breath voice speech whisper sigh cough sneeze yawn tear tears sweat
      heartbeat pulse blood hunger thirst weariness fatigue ache pain hurt sting
      itch shiver shudder tremble fever chill cramp limp blister bruise scratch
      sight sound smell scent odour stench taste touch feel glance gaze stare
      glimpse look peep squint wink blink nod shrug frown scowl sneer grimace
      smirk grin smile laugh chuckle giggle cackle guffaw snort sniff snuffle
      step pace stride footstep footfall tread track trace print hoofprint
      trail spoor mark sign clue hint rumour tidings news message word report
      errand task chore duty job work labour business affair matter concern
      question answer reply riddle puzzle guess notion idea plan scheme plot
      purpose reason cause excuse pretext trick ruse jest folly mistake blunder
      error fault sin crime deed act feat exploit venture risk danger peril
      hazard threat menace trouble mishap accident misfortune calamity
      disaster catastrophe ruin downfall doom end finish close conclusion
      start beginning outset dawn birth youth childhood manhood old age
      life living lifetime generation ancestor descendant offspring heir
      namesake nickname title surname name family clan house line
      folk people race kind sort manner fashion custom habit wont tradition
      rite ceremony ritual celebration anniversary occasion event gathering
      meeting assembly moot council company party crowd throng multitude horde
      swarm flock herd pack drove band gang crew troupe
      town village hamlet city borough township parish shire county province
      region district quarter country land realm kingdom empire border
      boundary frontier march edge rim brink verge fringe margin outskirts
      middle centre center heart core midst inside outside interior exterior
      top bottom side front rear corner angle curve bend turn twist loop
      circle ring round square cross line row heap pile stack bundle bunch
      cluster clump knot tangle mass lump chunk piece bit scrap shred fragment
      splinter sliver speck spot dot stain smudge smear patch streak stripe
      band belt strip thread string cord rope chain link hook eye loop
      handle knob grip hilt haft pole stick staff rod stake post beam plank
      board rafter pillar column arch vault dome roof ceiling floor wall
      stair stairs staircase step steps landing gallery balcony terrace
      courtyard yard garden gate door hatch trapdoor opening gap hole crack
      slit chink cranny nook corner recess alcove niche pocket hollow pit
      shaft well sump cistern pool basin trough gutter drain channel conduit
      pipe tube spout nozzle valve plug stopper cork lid cover cap hood
      wrap wrapping cloth linen wool leather silk velvet satin fur felt
      canvas sackcloth hemp flax cotton yarn stitch seam hem fold crease
      pleat tuck knot bow button hook eyelet buckle strap thong lace
      colour color hue tint shade tone gleam glint glimmer glow flicker
      spark flash blaze flare beam ray shaft glare dazzle sparkle lustre
      shine sheen polish surface layer crust coat film skin shell husk
      rind peel pod kernel grain seed pip stone core pith fibre
      warmth heat coolness cold chill damp wet dryness drought moisture
      sound noise din clamour clatter clang clash crash bang thud thump
      knock tap rap patter rustle crackle creak groan squeak squeal whine
      hum buzz drone murmur ripple splash gurgle trickle drip plop
      silence hush stillness quiet calm peace rest ease comfort leisure
      morning forenoon midday afternoon evening night bedtime supper
      today tomorrow yesterday tonight fortnight weekend daytime nighttime
      sooner later early late soon now then again already still yet always
      often seldom rarely sometimes suddenly slowly quickly swiftly softly
      gently loudly quietly silently plainly clearly dimly faintly barely
      hardly nearly almost quite rather very too enough indeed truly surely
      certainly perhaps maybe doubtless likely unlikely somehow somewhat
      somewhere anywhere everywhere nowhere elsewhere here there where
      away aside apart ahead behind before after above below under over
      across along around about against among between through throughout
      toward towards upward downward inward outward forward backward onward
      alongside overhead underfoot beneath uphill downhill upstream downstream
      north south east west northeast northwest southeast southwest
      one two three four five six seven eight nine ten eleven twelve
      thirteen twenty thirty forty fifty sixty seventy eighty ninety
      dozen score gross hundredweight furlong league mile yard foot inch
      pound ounce stone pint quart gallon bushel peck handful mouthful
      spoonful cupful armful basketful pocketful sackful
      sudden rapid gradual steady constant endless brief lasting fleeting
      true false real unreal right wrong fit unfit able unable ready unready
      safe unsafe sure unsure known unknown seen unseen heard unheard
      tired rested awake asleep alive alert aware astir afoot aflame afire
      astray aground ashore aloft alone along aloud amiss askew awry
      buried hidden covered wrapped tied bound loosed freed opened closed
      shuttered barred bolted locked sealed stoppered stopped blocked choked
      filled emptied spilled scattered strewn spread gathered heaped piled
      mended patched darned stitched sewn woven knitted spun dyed painted
      polished carved chiselled shaped moulded cast forged tempered honed
      sharpened ground milled baked brewed stewed roasted toasted smoked
      salted dried pickled preserved stored hoarded hidden cached buried
      lantern torchlight rushlight firelight candle glowworm
      road highway path track way route course passage journey trip tour
      outing jaunt ramble walk hike march trek expedition errand
      camp campfire bivouac shelter lean shelter refuge sanctuary haven
      retreat hideout hiding hideaway lair den nest roost perch
      pack knapsack rucksack satchel bundle load burden baggage luggage
      gear kit equipment supplies stores provisions rations waterskin
      bottle flask canteen tinderbox flint steel matches kindling firewood
      blanket bedroll groundsheet tent awning tarpaulin rope line
      compass map chart guide guidebook signpost milestone landmark
    `
  },
  {
    id: 'annals',
    name: 'Annals',
    hint: 'Names from the Silmarillion and the Appendices',
    on: true,
    words: `
      elendur aratan ciryon valandil eldacar arvegil arveleg araphor argeleb
      arvedui aranarth arahael aranuir aravir aragorn aravorn arahad argonui
      arador arathorn araglas arassuil arathorn meneldil cemendur eärendur
      anardil ostoher rómendacil turambar atanatar siriondil tarannon falastur
      hyarmendacil minalcar valacar castamir aldamir hyarmendacil minardil
      telemnar tarondor telumehtar narmacil calimehtar ondoher eärnil eärnur
      mardil eradan herion belegorn húrin túrin hador barahir dior denethor
      boromir cirion hallas egalmoth beren beregond belecthor thorondir turgon
      ecthelion elros vardamir tarmenelmacil aldarion ancalimë erendis
      tarcalion pharazôn miriel tarmíriel amandil elendil isildur anárion
      elendur aratan ciryon valandil eorl brego aldor fréa fréawine goldwine
      déor gram helm fréaláf brytta walda folca folcwine fengel thengel théoden
      éomer elfwine morwen théodwyn hild haleth hareth halmir haldir haldad
      hador galdor gundor gloredhel gumlin gilderin beleg mablung saeros
      daeron dior nimloth elured elurin elwing earendil elros elrond celebrían
      arwen elladan elrohir finwë míriel indis fëanor fingolfin finarfin
      maedhros maglor celegorm caranthir curufin amrod amras celebrimbor
      fingon turgon aredhel argon finrod orodreth angrod aegnor galadriel
      gil galad ereinion idril eärendil maeglin eöl ecthelion glorfindel
      penlod duilin rog salgant egalmoth tuor voronwë ulmo ossë uinen olwë
      elwë elmo thingol melian lúthien celeborn galathil nimloth amdír
      amroth nimrodel oropher thranduil legolas lenwë denethor nandor
      círdan gildor lindir erestor galdor orophin rúmil haldir mithrellas
      imrazôr ingold húrin morwen lalaith niënor hurin gwindor gelmir arminas
      finduilas brandir dorlas hunthor mîm khîm ibun andróg belegund baragund
      bregolas bregor boromir bëor balan belemir emeldir rían morwen nienor
      tuor annael andvír gethron grithnir bereth larnach ingold húrin
      ungoliant glaurung ancalagon scatha gostir thuringwethil draugluin
      carcharoth huan lungorthin gothmog durin azaghâl telchar gamil zirak
      narvi mîm náin dáin thrór thráin thorin frerin dís fíli kíli balin
      dwalin óin glóin gimli dori nori ori bifur bofur bombur ghân wenos
      ondoher artamir faramir minohtar minastan
      olórin curumo aiwendil alatar pallando tar ilúvatar melkor sauron
      mairon annatar gorthaur thû ossë ilmarë eönwë arien tilion salmar
      manwë varda ulmo aulë yavanna námo vairë irmo estë nienna oromë vána
      tulkas nessa
adalgrim adelard amaranth angelica asphodel belba berilac bingo blanco bodo bowman bucca bullroarer
camellia cotman dinodas doderic dodinas donnamira dora dudo erling esmeralda estella everard
fastolph ferdibrand ferdinand filibert flambard fosco gorbadoc gorbulas gorhendad griffo halfred
hanna hilda hildibrand hildifons hildigard hildigrim hob holfast hugo isembard isembold isumbras
lily longo mentha merimac mirabella moro mosco mungo myrtle odovacar olo orgulas pansy pearl peony
pervinca polo ponto porto posco prisca reginard rorimac rosa rosamunda rudigar ruby sadoc sancho
saradas saradoc seredic tanta tobold tolman baldor ceorl déorwine dúnhere eothain fastred folcred
fréca gálmód gárulf gléowine grimbold guthláf herefara herubrand léod léofa oswin widfara wulf
adrahil borlas derufin golasgil iorlas targon fimbrethil finglas fladrif skinbark leaflock
beechbone bregalad maggot grip fang wolf carl nick robin tom lotho ted bill bob nob
radbug ufthak muzgash lagduf shagrat gorbag snaga lugdush golfimbul
    `
  },
  {
    id: 'things',
    inflect: 'noun',
    name: 'Things',
    hint: 'Everyday objects, places and people in the tales',
    on: true,
    words: `
acre alley altar ankle archway attic avenue axle bale ball balloon bandage banister basin bath bead
beak bean bin bird blessing body bonfire boot border bottle bracket brain brick bride brim bullock
bush bushel cage canoe carving cat chamber channel chapel cheek chin choir chord cistern
city clay coach coal coast cobble coin collar comb comrade counter country crib crook crop crumb
crutch dairy dancer desk dinner doll dome drawer duck dungeon dwelling eave enemy fable fairy fathom
feather finger flock floor flower foal fold font frame friend fringe fruit furnace gable gallery
giant globe glove goblet griffin groom guide gulf hammock handle hatch hazel hermit hero hinge hive
hog hook host hour idol island jar jaw journey kite knee knob label lighthouse lip lute maid market
mask medal minstrel monk morsel moth mouth mule napkin neck niche noble nook nose oath owl page pail
palace palm pane paw pea peddler pedlar pew pier pig pike pillar pillow pit plank platform plume
pole prison prize pulpit pump puppet quarry queen raven razor ribbon robe rod roof room sailor saint
sash satchel scabbard scale sentry shack shoe shop shore shoulder shrine sieve silk skiff slab sleeve
slipper snail socket soldier span sprite stag statue steeple stem stick stile stool strap street
tail tapestry tassel tent thief tiger toad tomb tool toy tray tribe trophy trough tunnel turret urn
vane vase vine violin waist wand wreath yoke youth
arrowhead axehead bedchamber bootlace bowlful brazier campfire candleholder cartwheel causeway
chieftain cloakroom coronet crossbar crossroad crossbow dais doorframe dragonfly earthwork
farmhand farmyard fieldstone firebrand firepit flagpole flagstone floorboard footbridge footstep
forecourt foundry gatepost gateway gemstone gravestone greatcoat grindstone guardroom guildhall
hailstone hairpin handcart handhold hayrick headdress headland heartwood hilltop hobnail
homestead hoofbeat horsehair horseman household icefall inkpot inkwell ironwork keystone kinsfolk
lamppost landfall landslide lanyard larkspur lodestone longhouse lookout marketplace masthead
meadowland millpond millstone millrace moonbeam mountainside nightcap oakwood outcrop outhouse
overcoat oxcart paddock pathway pinecone pitchfork ploughshare porthole
rainwater rampart ringmail riverbank riverbed roadside rooftop rootstock rushlight
saddlebag sandbank sawmill scarecrow seashell seashore sheepfold shipyard shoreline signpost
skylight slingshot snowdrift snowfield spearpoint springtime stairwell starboard stepstone
stonework storehouse stormcloud streambed stronghold sunbeam sundial swordsmith tabletop
taproom thatch thunderhead timberland tollgate towpath treetop turnpike undergrowth
vineyard wagonload wainwright wallflower warhorse washbasin watchtower waterfront waterskin
waymark weathervane wellspring whetstone windmill windowsill wolfhound woodland woodpile
woodshed workbench workshop wristband yardarm
    `
  },
  {
    id: 'black',
    name: 'Black Speech',
    hint: 'Its sound is not for these doors',
    on: false,
    words: `
      ash nazg durbatulûk gimbatul thrakatulûk agh burzum ishi krimpatul ghâsh
      lugbúrz uruk olog snaga sharkû tark bagronk pushdug búbhosh skai glob gûl
      lug hai uglúk
    `
  }
].map(list => {
  const split = s => [...new Set((s || '').trim().split(/\s+/).filter(Boolean))]
  const words = split(list.words)
  const forms = list.inflect === 'noun' ? words.map(plural).filter(Boolean)
    : list.inflect === 'verb' ? words.flatMap(verbForms)
    : []
  const all = [...new Set([...words, ...split(list.also)])]
  return { ...list, words: all, forms: [...new Set(forms)].filter(w => !all.includes(w)) }
})
