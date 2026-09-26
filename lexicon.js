// Word lists for the generator. Each entry is one lowercase word with no
// spaces or hyphens; multi-word names are run together ("minastirith").
// Diacritics are kept here and folded away at generation time unless the
// "keep accents" option is on. Duplicates across lists are removed when the
// pool is built, so entropy is always computed on the real unique count.
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
].map(list => ({ ...list, words: list.words.trim().split(/\s+/) }))
