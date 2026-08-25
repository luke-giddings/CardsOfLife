// ---------------------------------------------------------------------------
// Localisation. Cards (and the UI) carry string IDs, not raw text; the actual
// words live in the tables below, one per language.
//
//   EN  — the master table (authored `as const`, so its keys define StringId).
//   IT  — Italian, typed `Record<StringId, string>` so a missing translation is
//         a compile error (and an extra/typo'd key is too).
//
// A card that references a string id not in EN is a compile error (the id
// fields on Content are typed `StringId`). `t(id)` looks the id up in the
// current locale, falling back to English, then to the id itself so nothing
// ever renders blank.
//
// ID CONVENTION:
//   <cardid>.prompt          the card's prompt
//   <cardid>.<dir>           an option's label (dir = left/right/up/down)
//   <cardid>.<dir>.r<i>      the i-th outcome's result text for that option
//   deck.<id>.title/.blurb   a deck's first-unlock announcement
//   status.<kind>.<state>    a status state's chip label
//   statuskind.<kind>        the status chip's bold prefix (Job/Home/…)
//   vital.<key>              a vital's label
//   ending.<id>.title/.blurb an end screen
//   ui.*                     UI chrome
//
// NOTE (Italian gender): where Italian forces gender agreement on the player
// (past participles, adjectives) the masculine form is used as a default. The
// sibling cards keep separate brother/sister result ids so those read correctly.
// A fuller gendered pass (variant strings keyed on the gender trait) is a later
// job.
// ---------------------------------------------------------------------------

export const EN = {
  // ---- BABY -------------------------------------------------------------
  "baby_birth.prompt": "You have just been born!\n\nSwipe to choose — are you a boy or a girl?",
  "baby_birth.left": "Boy",
  "baby_birth.left.r0": "A boy. Your story begins.",
  "baby_birth.right": "Girl",
  "baby_birth.right.r0": "A girl. Your story begins.",

  "baby_firststeps.prompt": "You take your first wobbly steps!\n\nEach choice boosts a different stat — watch the bars. Where do you toddle?",
  "baby_firststeps.left": "To your toys",
  "baby_firststeps.left.r0": "Hours of giggling, gurgling fun.",
  "baby_firststeps.right": "To your parents",
  "baby_firststeps.right.r0": "A proud, loving cuddle.",
  "baby_firststeps.down": "To your cot",
  "baby_firststeps.down.r0": "A long nap does you the world of good.",

  "baby_uncle.prompt": "Your well-off uncle wants to help the little one out.",
  "baby_uncle.left": "A mountain of toys!",
  "baby_uncle.left.r0": "Christmas comes early. Wrapping paper everywhere.",
  "baby_uncle.right": "A university trust fund",
  "baby_uncle.right.r0": "Quietly tucked away for a clever future.",
  "baby_uncle.down": "Healthy food & baby classes",
  "baby_uncle.down.r0": "Organic everything and splashy swim lessons.",

  "baby_bookworm.prompt": "You reach for the same picture book, over and over again.",
  "baby_bookworm.left": "Read together nightly",
  "baby_bookworm.left.r0": "A shared love of stories takes root.",
  "baby_bookworm.right": "Run wild outside",
  "baby_bookworm.right.r0": "You tear about the yard with the other urchins.",

  "baby_sporty.prompt": "You will NOT sit still for one single second.",
  "baby_sporty.left": "Enrol in tumble-tots",
  "baby_sporty.left.r0": "Forward rolls and gloriously grazed knees.",
  "baby_sporty.right": "Let them wear out",
  "baby_sporty.right.r0": "You crash out, fast asleep, by 7pm sharp.",

  "baby_grandma.prompt": "Grandma is absolutely determined to spoil you rotten.",
  "baby_grandma.left": "Second helpings of pudding!",
  "baby_grandma.left.r0": "A lifelong sweet tooth is born.",
  "baby_grandma.right": "Just a little treat",
  "baby_grandma.right.r0": "A wholesome bit of everything, in moderation.",
  "baby_grandma.down": "Bank it for the future",
  "baby_grandma.down.r0": "She squirrels the treat money into a savings account for you.",

  "baby_vaccine.prompt": "The vaccinator calls at the door with his lancet — the smallpox jab.",
  "baby_vaccine.left": "Brave the lancet",
  "baby_vaccine.left.r0": "One yelp, and it's done. You're protected against the pox.",
  "baby_vaccine.right": "Squirm free",
  "baby_vaccine.right.r0": "You wriggle free and dig your heels in — nobody pins you down.",

  "baby_nursery.prompt": "Should you start at the local nursery?",
  "baby_nursery.left": "Off you go!",
  "baby_nursery.left.r0": "New friends, finger paints and snack time.",
  "baby_nursery.right": "Stay home a while",
  "baby_nursery.right.r0": "Cosy, unhurried, well-rested days at home.",

  "baby_brother.prompt": "Big news — a baby brother has arrived!",
  "baby_brother.left": "Adore him",
  "baby_brother.left.r0": "You appoint yourself his chief protector.",
  "baby_brother.right": "Cold shoulder",
  "baby_brother.right.r0": "You keep your distance and your own world.",

  "baby_sister.prompt": "Big news — a baby sister has arrived!",
  "baby_sister.left": "Adore her",
  "baby_sister.left.r0": "Instant best friend and partner in crime.",
  "baby_sister.right": "Cold shoulder",
  "baby_sister.right.r0": "You keep to yourself and your own world.",

  "baby_schooling.prompt": "The family has fallen on hard times, and you're old enough to be some use now. Off to school to better yourself — or out to work to help feed the family?",
  "baby_schooling.left": "Go to school",
  "baby_schooling.left.r0": "Slate, chalk, and a stern schoolmaster. A chance at something more.",
  "baby_schooling.right": "Out to work",
  "baby_schooling.right.r0": "Long hours in the din for a few coins in the family pot.",

  // ---- CHILDHOOD --------------------------------------------------------
  "child_martialarts.prompt": "Old Tom, a retired prizefighter, offers to teach the local lads to box.",
  "child_martialarts.left": "Learn to box",
  "child_martialarts.left.r0": "Fists up, chin down. You learn to handle yourself — for a few coins.",
  "child_martialarts.right": "Keep your head down",
  "child_martialarts.right.r0": "You keep your pennies and your quiet life — but never learn to stand up for yourself.",

  "child_bully.prompt": "A bully shoves you hard in the yard. Everyone is watching.",
  "child_bully.left": "Fight back",
  "child_bully.left.r0": "You calmly floor them. The yard cheers — bar one scraped knuckle.",
  "child_bully.left.r1": "A bloody nose. You stood your ground, but it really hurt.",
  "child_bully.right": "Walk away",
  "child_bully.right.r0": "You avoid the beating, but the humiliation festers for weeks.",

  "child_sports.prompt": "The lads get up a rough game of football in the muddy street.",
  "child_sports.left": "Go all-out",
  "child_sports.left.r0": "Wrecked, grass-stained and fiercely proud.",
  "child_sports.right": "Take it easy",
  "child_sports.right.r0": "A laugh on the sidelines, but unfit and a bit of a let-down.",

  "child_fever.prompt": "A fever sweeps through the street, and now it is burning through you.",
  "child_fever.left": "Sweat it out",
  "child_fever.left.r0": "Your inoculation holds. You pull through, pale but alive.",
  "child_fever.left.r1": "You are strong enough to fight it off.",
  "child_fever.left.r2": "You are too weak. The fever takes you in the night.",
  "child_fever.right": "Send for the doctor",
  "child_fever.right.r0": "The doctor's tonic works — dear, but worth every penny.",
  "child_fever.right.r1": "No coin for a doctor, but you are just hardy enough to endure.",
  "child_fever.right.r2": "No money and no strength. The fever wins.",

  "child_accident.prompt": "A runaway cart thunders down the cobbles — straight at you!",
  "child_accident.left": "Leap clear",
  "child_accident.left.r0": "Quick as a cat, you spring aside.",
  "child_accident.left.r1": "You dive and roll — bruised, but whole.",
  "child_accident.left.r2": "You are not quick enough.",
  "child_accident.right": "Throw yourself aside",
  "child_accident.right.r0": "Scraped raw and winded in the gutter — but you scramble up alive.",
  "child_accident.right.r1": "You don't get clear in time. The wheels do not stop.",

  "child_hunger.prompt": "The last coin is spent, the cupboards are bare, and there's nowhere left to turn.",
  "child_hunger.left": "Take to the streets",
  "child_hunger.left.r0": "Better the open road than the workhouse gate. Free, if you can survive it.",
  "child_hunger.right": "Into the workhouse",
  "child_hunger.right.r0": "You trade your liberty for a roof and a full belly tonight. The grind starts tomorrow.",

  "child_adult.prompt": "Against the odds, you reach eighteen. So many did not. Childhood is behind you.",
  "child_adult.left": "Look back",
  "child_adult.left.r0": "You survived. So much has happened already…",
  "child_adult.right": "Charge ahead",
  "child_adult.right.r0": "You made it this far. Whatever comes next, you're ready.",

  // ---- HOME: FAMILY -----------------------------------------------------
  "home_family_chores.prompt": "Your parents offer pocket money for helping around the house.",
  "home_family_chores.left": "Do the chores",
  "home_family_chores.left.r0": "Money in your pocket and a puffed-out chest — but no play.",
  "home_family_chores.right": "Go play",
  "home_family_chores.right.r0": "Fun and fresh air, and an empty piggy bank.",

  "home_family_sweets.prompt": "The sweet-shop window: humbugs, sherbet and liquorice, a farthing a twist.",
  "home_family_sweets.left": "Buy a bagful",
  "home_family_sweets.left.r0": "That sweet tooth wins — you buy double and regret nothing (yet).",
  "home_family_sweets.left.r1": "Sugar heaven — bad for your teeth and your pocket.",
  "home_family_sweets.right": "Save your coins",
  "home_family_sweets.right.r0": "Walking past the pick-and-mix is agony, but your willpower hardens.",
  "home_family_sweets.right.r1": "The piggy bank grows. Easy, when you're not that fussed.",

  "home_family_pet.prompt": "A scruffy stray cat follows you all the way home.",
  "home_family_pet.left": "Take it in",
  "home_family_pet.left.r0": "A new best friend who gets you outdoors — vet bills and all.",
  "home_family_pet.right": "Shoo it off",
  "home_family_pet.right.r0": "You save the hassle and the money, but feel a pang.",

  "home_family_market.prompt": "Mother sends you to market with the week's pennies and a long list.",
  "home_family_market.left": "Haggle for every penny",
  "home_family_market.left.r0": "You drive a hard bargain and bring change home. Mother is impressed; your feet are sore.",
  "home_family_market.right": "Treat yourself on the way",
  "home_family_market.right.r0": "A hot pie eaten in a doorway — blissful, and a farthing short.",

  "home_family_fair.prompt": "A travelling fair sets up on the common: swingboats, a coconut shy, toffee apples.",
  "home_family_fair.left": "Spend your pennies",
  "home_family_fair.left.r0": "Rides, sweets and a stomach-ache to remember. Worth every coin.",
  "home_family_fair.right": "Just watch the crowds",
  "home_family_fair.right.r0": "You keep your coppers and take it all in from the fence. A quiet sort of pride.",

  "home_family_church.prompt": "Sunday, and the whole family files into the pew in its Sunday best.",
  "home_family_church.left": "Sit still and sing",
  "home_family_church.left.r0": "You lose yourself in the hymns. An hour of stillness does the soul good.",
  "home_family_church.right": "Fidget and daydream",
  "home_family_church.right.r0": "You count the rafters and pull faces at the baby behind — but the sermon drags.",

  "home_family_relative.prompt": "A well-to-do aunt is visiting, full of opinions and, perhaps, a spare shilling.",
  "home_family_relative.left": "Play the charmer",
  "home_family_relative.left.r0": "A shilling pressed into your palm — earned with a good deal of 'yes, Auntie'.",
  "home_family_relative.right": "Speak your mind",
  "home_family_relative.right.r0": "You say what you think. No shilling, but Mother hides a smile and you feel ten feet tall.",

  "home_family_scrump.prompt": "The orchard wall is low, the apples are ripe, and the farmer's dog is asleep.",
  "home_family_scrump.left": "Over the wall",
  "home_family_scrump.left.r0": "Pockets full of stolen apples and a torn sleeve — a glorious, guilty feast.",
  "home_family_scrump.right": "Resist temptation",
  "home_family_scrump.right.r0": "You walk on by. Hungrier and a touch smug, but with a clear conscience.",

  "home_family_moveout.prompt": "You've squirrelled away enough to put down for lodgings of your own. Time to fly the nest?",
  "home_family_moveout.left": "Move out",
  "home_family_moveout.left.r0": "A cramped rented flat, a key of your own, and no one to answer to. It cost you nearly everything — worth it.",
  "home_family_moveout.right": "Stay home",
  "home_family_moveout.right.r0": "The nest egg stays put, and so do you. For now.",

  // ---- HOME: RENTING ----------------------------------------------------
  "deck.home_renting.title": "Your Own Place",
  "deck.home_renting.blurb": "A key of your own and a rent book to fill. No one to answer to — as long as you can cover the rent.",

  "home_renting_lodger.prompt": "Rent day again, and the box room sits empty. You could take in a lodger.",
  "home_renting_lodger.left": "Take a lodger",
  "home_renting_lodger.left.r0": "The rent's halved, but so is your peace and quiet.",
  "home_renting_lodger.right": "Keep it to yourself",
  "home_renting_lodger.right.r0": "Your own four walls, undisturbed — and the whole rent on you.",

  "home_renting_landlord.prompt": "The landlord raps at the door: the rent's going up, he says, times being what they are.",
  "home_renting_landlord.left": "Pay the increase",
  "home_renting_landlord.left.r0": "You grit your teeth and pay. At least the roof stays over your head.",
  "home_renting_landlord.right": "Threaten to leave",
  "home_renting_landlord.right.r0": "You call his bluff — and he backs down. Nerve-wracking, but the rent holds.",

  "home_renting_furnish.prompt": "The flat echoes, bare. A barrow in the market has second-hand furniture going cheap.",
  "home_renting_furnish.left": "Do the place up",
  "home_renting_furnish.left.r0": "A rug, a lamp, a decent chair — it finally feels like home.",
  "home_renting_furnish.right": "Make do with crates",
  "home_renting_furnish.right.r0": "An orange box for a table and a nail for your coat. Cheap, and cheerless.",

  "home_renting_neighbour.prompt": "The couple across the landing knock round with an invitation to supper.",
  "home_renting_neighbour.left": "Join them",
  "home_renting_neighbour.left.r0": "A warm evening of stew and gossip — you bring a little something along.",
  "home_renting_neighbour.right": "Beg off",
  "home_renting_neighbour.right.r0": "An early night and an untouched purse — but you feel the cold shoulder.",

  "home_renting_quiet.prompt": "A rare free evening, with nothing but your own four walls and the fire.",
  "home_renting_quiet.left": "Rest by the fire",
  "home_renting_quiet.left.r0": "You mend, you doze, you breathe — quiet, if a little lonely.",
  "home_renting_quiet.right": "Out on the town",
  "home_renting_quiet.right.r0": "Gin, songs and bad decisions. A grand night — you'll pay for it tomorrow.",

  // ---- HOME: WORKHOUSE --------------------------------------------------
  "home_workhouse_gruel.prompt": "Supper is a bowl of thin gruel, and your belly still aches. The pot is not quite empty.",
  "home_workhouse_gruel.left": "Ask for more",
  "home_workhouse_gruel.left.r0": "The master's face purples — 'MORE?!' — but a kindly server slips you a crust in the scramble.",
  "home_workhouse_gruel.right": "Go without",
  "home_workhouse_gruel.right.r0": "You swallow your hunger and your pride both. At least no one shouts.",

  "home_workhouse_oakum.prompt": "Twelve hours picking oakum — teasing tarred rope apart until your fingertips are raw. There's a penny in it for a full basket.",
  "home_workhouse_oakum.left": "Hit your quota",
  "home_workhouse_oakum.left.r0": "Bleeding fingers and an aching back — but a few coins toward buying your way out one day.",
  "home_workhouse_oakum.right": "Botch it in protest",
  "home_workhouse_oakum.right.r0": "A small, secret rebellion — worth the cold cell and the skipped supper.",

  "home_workhouse_friend.prompt": "In the next cot, a child as wretched as you offers a whispered friendship after lights-out.",
  "home_workhouse_friend.left": "Whisper back",
  "home_workhouse_friend.left.r0": "Two conspirators against the dark. You laugh for the first time in weeks — and lose an hour's sleep.",
  "home_workhouse_friend.right": "Keep to yourself",
  "home_workhouse_friend.right.r0": "Safer, and lonelier. You save your strength and spend your evenings alone.",

  "home_workhouse_sunday.prompt": "Sunday. An hour of chapel — the one break in the grey week — and a hymn you actually know.",
  "home_workhouse_sunday.left": "Sing your heart out",
  "home_workhouse_sunday.left.r0": "For a few minutes the misery lifts and your voice rings off the cold stone.",
  "home_workhouse_sunday.right": "Doze at the back",
  "home_workhouse_sunday.right.r0": "You steal a little rest in the warm crush of bodies — and feel nothing much at all.",

  "home_workhouse_matron.prompt": "The matron, stern as flint, takes an unexpected shine to you.",
  "home_workhouse_matron.left": "Play the favourite",
  "home_workhouse_matron.left.r0": "Extra bread and a warmer corner — bought with a good deal of bowing and scraping.",
  "home_workhouse_matron.right": "Keep your dignity",
  "home_workhouse_matron.right.r0": "You'll not grovel for anyone. She soon tires of you — but you can still look yourself in the eye.",

  "home_workhouse_buyout.prompt": "You've squirrelled away just enough. The master will strike your name off the register — for a price.",
  "home_workhouse_buyout.left": "Buy your freedom",
  "home_workhouse_buyout.left.r0": "Coins counted onto the desk, and the gate swings open. A cramped rented room, but it's yours.",
  "home_workhouse_buyout.right": "Keep saving",
  "home_workhouse_buyout.right.r0": "Not yet — you tuck the coins away and hold out for a better day.",

  "home_workhouse_runaway.prompt": "A side gate is left unlatched in the grey before dawn. You could just… go.",
  "home_workhouse_runaway.left": "Run for it",
  "home_workhouse_runaway.left.r0": "Heart pounding, you bolt — and don't stop until the workhouse is far behind. Free, and utterly on your own.",
  "home_workhouse_runaway.right": "Stay put",
  "home_workhouse_runaway.right.r0": "The risk is too great, the world outside too cold. You slink back to your cot.",

  "home_workhouse_apprentice.prompt": "A visiting tradesman needs a willing pair of hands, and will take an apprentice off the parish's books.",
  "home_workhouse_apprentice.left": "Take the indenture",
  "home_workhouse_apprentice.left.r0": "A trade, a master's roof, and a future you can build. The workhouse gates close behind you for good.",
  "home_workhouse_apprentice.right": "Let it pass",
  "home_workhouse_apprentice.right.r0": "Not this one. You watch the tradesman go, and hope another comes.",

  // ---- EDUCATION: BASIC SCHOOL -----------------------------------------
  "edu_basicschool_exams.prompt": "Big examinations loom, and the schoolmaster expects great things.",
  "edu_basicschool_exams.left": "Study hard",
  "edu_basicschool_exams.left.r0": "The books come easily to a natural reader — top marks, and you rather enjoyed it.",
  "edu_basicschool_exams.left.r1": "Top marks — earned with stress and sleepless nights.",
  "edu_basicschool_exams.right": "Wing it",
  "edu_basicschool_exams.right.r0": "Relaxed and well-rested, but the results sting.",

  "edu_basicschool_crush.prompt": "Your heart does something strange when a certain classmate walks by.",
  "edu_basicschool_crush.left": "Say hello",
  "edu_basicschool_crush.left.r0": "They smile back! Butterflies, and not much sleep.",
  "edu_basicschool_crush.right": "Panic and hide",
  "edu_basicschool_crush.right.r0": "You dive behind the coal shed. Mortifying — but the panic soon passes.",

  "edu_basicschool_friend.prompt": "The new pupil is looking for someone to share a desk with.",
  "edu_basicschool_friend.left": "Wave over",
  "edu_basicschool_friend.left.r0": "A wonderful friend — though you rather lose yourself in them.",
  "edu_basicschool_friend.right": "Look away",
  "edu_basicschool_friend.right.r0": "A lonelier term, but you learn to stand on your own two feet.",

  "edu_basicschool_prize.prompt": "Prize-giving day. The medal for best pupil is within your reach.",
  "edu_basicschool_prize.left": "Swot for it",
  "edu_basicschool_prize.left.r0": "You've half-read the syllabus for pleasure already — the medal's yours, no sweat.",
  "edu_basicschool_prize.left.r1": "The medal is yours — pinned on to polite applause.",
  "edu_basicschool_prize.right": "Let it go",
  "edu_basicschool_prize.right.r0": "You'd rather be out playing than buried in books.",

  "edu_basicschool_errands.prompt": "A shopkeeper will pay a child to run deliveries after lessons.",
  "edu_basicschool_errands.left": "Take the round",
  "edu_basicschool_errands.left.r0": "Aching legs and homework left undone — but coins in your pocket.",
  "edu_basicschool_errands.right": "Straight home",
  "edu_basicschool_errands.right.r0": "You keep your evenings for rest and your books — and stay skint.",

  "edu_basicschool_leaver.prompt": "You've reached the end of your schooling and earned your certificate. What now?",
  "edu_basicschool_leaver.left": "Stay and study",
  "edu_basicschool_leaver.left.r0": "You'll press on for a proper education — slate and chalk a while longer.",
  "edu_basicschool_leaver.right": "Leave for work",
  "edu_basicschool_leaver.right.r0": "Books away, cap on. It's time to go out and earn your keep.",

  // ---- JOB: UNEMPLOYED --------------------------------------------------
  "deck.job_unemployed.title": "Out of Work",
  "deck.job_unemployed.blurb": "School's behind you and the world's in front — but no wage in your pocket yet. Time to find work.",
  "job_unemployed_offer.prompt": "Word gets round that you're after work, and two positions are going.",
  "job_unemployed_offer.left": "The shop counter",
  "job_unemployed_offer.left.r0": "Behind the counter of the corner shop — respectable, steady, and yours.",
  "job_unemployed_offer.right": "The factory floor",
  "job_unemployed_offer.right.r0": "The mill: louder, harder, and better paid.",
  "job_unemployed_offer.down": "Hold out for better",
  "job_unemployed_offer.down.r0": "Not those two. You'll keep looking a while yet.",
  "job_unemployed_idle.prompt": "Another day tramping the streets, cap in hand, with no work in sight.",
  "job_unemployed_idle.left": "Keep knocking on doors",
  "job_unemployed_idle.left.r0": "Blistered feet and a bruised ego, but you keep your hopes up.",
  "job_unemployed_idle.right": "Rest up today",
  "job_unemployed_idle.right.r0": "You put your feet up — and feel the guilt of an idle day.",

  // ---- JOB: LABOUR ------------------------------------------------------
  "job_labour_machine.prompt": "The foreman waves you under the thundering loom to clear a jam.",
  "job_labour_machine.left": "Reach in",
  "job_labour_machine.left.r0": "Deft, nimble fingers — the jam clears, no harm done.",
  "job_labour_machine.left.r1": "A nasty gash across your hand, but you manage.",
  "job_labour_machine.left.r2": "The machine does not stop for anyone.",
  "job_labour_machine.right": "Refuse",
  "job_labour_machine.right.r0": "The foreman docks your pay and clips your ear.",

  "job_labour_wages.prompt": "Friday, and the foreman counts out your wages.",
  "job_labour_wages.left": "All to the family",
  "job_labour_wages.left.r0": "Every penny to the family pot. They are proud of you.",
  "job_labour_wages.right": "Keep a little back",
  "job_labour_wages.right.r0": "A secret farthing for yourself — guilty, but glad.",

  // ---- SIBLING (brother = r0, sister = r1) ------------------------------
  "sibling_play.prompt": "Your little sibling is begging you to come and play.",
  "sibling_play.left": "Play along",
  "sibling_play.left.r0": "You build an epic blanket fort together. Best mates.",
  "sibling_play.left.r1": "You build an epic blanket fort together. Best mates.",
  "sibling_play.right": "Wind them up",
  "sibling_play.right.r0": "You hide their favourite toy. Cue meltdown.",
  "sibling_play.right.r1": "You hide their favourite toy. Cue meltdown.",

  "sibling_blame.prompt": "Something's broken, and a parent is demanding to know who did it.",
  "sibling_blame.left": "Take the blame",
  "sibling_blame.left.r0": "You cover for your brother. He never forgets it.",
  "sibling_blame.left.r1": "You cover for your sister. She never forgets it.",
  "sibling_blame.right": "Point the finger",
  "sibling_blame.right.r0": "You dob your brother in. You're off the hook — he isn't.",
  "sibling_blame.right.r1": "You dob your sister in. You're off the hook — she isn't.",

  "sibling_treat.prompt": "There is exactly one biscuit left in the tin.",
  "sibling_treat.left": "Split it fairly",
  "sibling_treat.left.r0": "Half each, no arguments. Your brother grins.",
  "sibling_treat.left.r1": "Half each, no arguments. Your sister grins.",
  "sibling_treat.right": "Scoff it yourself",
  "sibling_treat.right.r0": "Delicious. Your brother is furious.",
  "sibling_treat.right.r1": "Delicious. Your sister is furious.",

  // ---- DECK unlock announcements ---------------------------------------
  "deck.childhood.title": "Childhood",
  "deck.childhood.blurb": "You're a child now — a whole world of scraped knees, best friends and hard knocks awaits.",
  "deck.home_workhouse.title": "The Workhouse",
  "deck.home_workhouse.blurb": "Cold stone, thin gruel and the endless clatter of labour. This is home now — until you can find a way out.",
  "deck.sibling.title": "Your Sibling",
  "deck.sibling.blurb": "You've got a little sidekick now — partner in crime, or thorn in your side. That's up to you.",

  // ---- STATUS state labels ---------------------------------------------
  "status.job.infant": "None",
  "status.job.child_labourer": "Child labourer",
  "status.job.studying": "Pupil",
  "status.job.apprentice": "Apprentice",
  "status.job.unemployed": "Unemployed",
  "status.job.shophand": "Shop assistant",
  "status.job.factory": "Factory hand",
  "status.housing.family": "With family",
  "status.housing.workhouse": "Workhouse",
  "status.housing.renting": "Renting",
  "status.housing.homeless": "Homeless",
  "status.housing.apprentice": "With a master",
  "status.education.none": "Illiterate",
  "status.education.school": "Basic schooling",

  // ---- STATUS kind (chip prefix) ---------------------------------------
  "statuskind.job": "Job",
  "statuskind.housing": "Home",
  "statuskind.education": "Education",
  "statuskind.lifestyle": "Life",

  // ---- VITALS -----------------------------------------------------------
  "vital.finances": "Finances",
  "vital.happiness": "Happiness",
  "vital.health": "Health",
  "vital.spirit": "Spirit",

  // ---- ENDINGS ----------------------------------------------------------
  "ending.finances.title": "Bankrupt",
  "ending.finances.blurb": "The money ran out, and with it your options.",
  "ending.happiness.title": "Despair",
  "ending.happiness.blurb": "The joy drained away until there was none left to find.",
  "ending.health.title": "Death",
  "ending.health.blurb": "Your body gave out. A life reached its end.",
  "ending.spirit.title": "Emptiness",
  "ending.spirit.blurb": "The spark went out. You were still here, but not really.",
  "ending.grown_up.title": "You Survived Childhood",
  "ending.grown_up.blurb": "Half your street didn't see eighteen — but you did. The rest of your story is still to be written…",

  // ---- UI chrome --------------------------------------------------------
  "ui.yearsOld": "years old",
  "ui.easy": "Easy",
  "ui.easyTip": "Easy mode: preview each choice's effect on your vitals",
  "ui.debug": "Debug",
  "ui.debugTip": "Toggle debug info",
  "ui.reset": "Reset",
  "ui.resetTip": "Debug: wipe the save and start a new life",
  "ui.newborn": "Newborn",
  "ui.age": "Age {n}",
  "ui.tapContinue": "Tap to continue",
  "ui.tapBegin": "Tap to begin",
  "ui.newChapter": "A new chapter",
  "ui.reachedYears": "You reached <b>{n}</b> years.",
  "ui.newLife": "New life",
  "ui.bornBoy": "Born a boy",
  "ui.bornGirl": "Born a girl",
  "ui.recapMartial": "Learned martial arts",
} as const;

export type StringId = keyof typeof EN;

// Italian. Typed against StringId so every id must be present (and none extra).
export const IT: Record<StringId, string> = {
  // ---- BABY -------------------------------------------------------------
  "baby_birth.prompt": "Sei appena nato!\n\nScorri per scegliere — sei un maschio o una femmina?",
  "baby_birth.left": "Maschio",
  "baby_birth.left.r0": "Un maschio. La tua storia comincia.",
  "baby_birth.right": "Femmina",
  "baby_birth.right.r0": "Una femmina. La tua storia comincia.",

  "baby_firststeps.prompt": "Muovi i tuoi primi passi incerti!\n\nOgni scelta aumenta una statistica diversa — osserva le barre. Dove ti dirigi?",
  "baby_firststeps.left": "Verso i giocattoli",
  "baby_firststeps.left.r0": "Ore di risatine e versetti felici.",
  "baby_firststeps.right": "Verso i genitori",
  "baby_firststeps.right.r0": "Un abbraccio fiero e pieno d'amore.",
  "baby_firststeps.down": "Verso la culla",
  "baby_firststeps.down.r0": "Un bel sonnellino ti fa un gran bene.",

  "baby_uncle.prompt": "Il tuo zio benestante vuole dare una mano al piccolo.",
  "baby_uncle.left": "Una montagna di giocattoli!",
  "baby_uncle.left.r0": "Il Natale arriva in anticipo. Carta da regalo ovunque.",
  "baby_uncle.right": "Un fondo per l'università",
  "baby_uncle.right.r0": "Messo da parte in silenzio per un futuro brillante.",
  "baby_uncle.down": "Cibo sano e corsi per bebè",
  "baby_uncle.down.r0": "Tutto biologico e allegre lezioni di nuoto.",

  "baby_bookworm.prompt": "Allunghi la mano verso lo stesso libro illustrato, ancora e ancora.",
  "baby_bookworm.left": "Leggere insieme ogni sera",
  "baby_bookworm.left.r0": "Nasce un amore condiviso per le storie.",
  "baby_bookworm.right": "Scatenarsi all'aperto",
  "baby_bookworm.right.r0": "Corri sfrenato per il cortile con gli altri monelli.",

  "baby_sporty.prompt": "Non stai fermo un solo secondo.",
  "baby_sporty.left": "Iscriverti a ginnastica per piccoli",
  "baby_sporty.left.r0": "Capriole in avanti e ginocchia gloriosamente sbucciate.",
  "baby_sporty.right": "Lasciarti sfogare",
  "baby_sporty.right.r0": "Crolli addormentato, di sasso, alle 7 in punto.",

  "baby_grandma.prompt": "La nonna è assolutamente decisa a viziarti a più non posso.",
  "baby_grandma.left": "Bis di budino!",
  "baby_grandma.left.r0": "Nasce una golosità che durerà tutta la vita.",
  "baby_grandma.right": "Solo un dolcetto",
  "baby_grandma.right.r0": "Un po' di tutto, con sana moderazione.",
  "baby_grandma.down": "Metterlo da parte per il futuro",
  "baby_grandma.down.r0": "Mette i soldi del dolcetto in un salvadanaio per te.",

  "baby_vaccine.prompt": "Il vaccinatore bussa alla porta con la sua lancetta — il vaccino contro il vaiolo.",
  "baby_vaccine.left": "Affrontare la lancetta",
  "baby_vaccine.left.r0": "Un guaito, ed è fatta. Sei protetto dal vaiolo.",
  "baby_vaccine.right": "Divincolarti",
  "baby_vaccine.right.r0": "Ti divincoli e pianti i piedi — nessuno ti tiene fermo.",

  "baby_nursery.prompt": "Dovresti iniziare all'asilo del quartiere?",
  "baby_nursery.left": "Vai pure!",
  "baby_nursery.left.r0": "Nuovi amici, pittura a dita e la merenda.",
  "baby_nursery.right": "Restare a casa ancora un po'",
  "baby_nursery.right.r0": "Giornate tranquille, senza fretta e ben riposate a casa.",

  "baby_brother.prompt": "Grande notizia — è arrivato un fratellino!",
  "baby_brother.left": "Adorarlo",
  "baby_brother.left.r0": "Ti nomini suo protettore in capo.",
  "baby_brother.right": "Ignorarlo",
  "baby_brother.right.r0": "Mantieni le distanze e il tuo piccolo mondo.",

  "baby_sister.prompt": "Grande notizia — è arrivata una sorellina!",
  "baby_sister.left": "Adorarla",
  "baby_sister.left.r0": "Migliore amica e complice all'istante.",
  "baby_sister.right": "Ignorarla",
  "baby_sister.right.r0": "Te ne stai per conto tuo, nel tuo mondo.",

  "baby_schooling.prompt": "La famiglia è caduta in miseria, e ormai sei grande abbastanza per renderti utile. A scuola per migliorarti — o al lavoro per aiutare a sfamare la famiglia?",
  "baby_schooling.left": "Andare a scuola",
  "baby_schooling.left.r0": "Lavagna, gesso e un maestro severo. Una possibilità di qualcosa di più.",
  "baby_schooling.right": "Andare a lavorare",
  "baby_schooling.right.r0": "Lunghe ore nel frastuono per qualche moneta nel bilancio di famiglia.",

  // ---- CHILDHOOD --------------------------------------------------------
  "child_martialarts.prompt": "Il vecchio Tom, un ex pugile, si offre di insegnare a boxare ai ragazzi del quartiere.",
  "child_martialarts.left": "Imparare a boxare",
  "child_martialarts.left.r0": "Pugni alti, mento basso. Impari a difenderti — per qualche moneta.",
  "child_martialarts.right": "Non farti notare",
  "child_martialarts.right.r0": "Tieni i tuoi spiccioli e la tua vita tranquilla — ma non impari mai a farti valere.",

  "child_bully.prompt": "Un bullo ti spinge con forza nel cortile. Tutti stanno guardando.",
  "child_bully.left": "Reagire",
  "child_bully.left.r0": "Lo stendi con calma. Il cortile esulta — a parte una nocca sbucciata.",
  "child_bully.left.r1": "Un naso sanguinante. Hai tenuto testa, ma ha fatto davvero male.",
  "child_bully.right": "Andartene",
  "child_bully.right.r0": "Eviti le botte, ma l'umiliazione cova per settimane.",

  "child_sports.prompt": "I ragazzi improvvisano una partita di pallone nella strada fangosa.",
  "child_sports.left": "Dare il massimo",
  "child_sports.left.r0": "Distrutto, macchiato d'erba e fieramente orgoglioso.",
  "child_sports.right": "Prendersela comoda",
  "child_sports.right.r0": "Due risate a bordo campo, ma fuori forma e un po' deludente.",

  "child_fever.prompt": "Una febbre dilaga per la strada, e ora sta bruciando dentro di te.",
  "child_fever.left": "Sudarla via",
  "child_fever.left.r0": "La tua vaccinazione tiene. Ne esci pallido ma vivo.",
  "child_fever.left.r1": "Sei abbastanza forte da vincerla.",
  "child_fever.left.r2": "Sei troppo debole. La febbre ti porta via nella notte.",
  "child_fever.right": "Chiamare il dottore",
  "child_fever.right.r0": "Il tonico del dottore funziona — caro, ma vale ogni centesimo.",
  "child_fever.right.r1": "Niente soldi per il dottore, ma sei giusto abbastanza robusto da resistere.",
  "child_fever.right.r2": "Né soldi né forze. La febbre vince.",

  "child_accident.prompt": "Un carro impazzito rimbomba sul selciato — dritto verso di te!",
  "child_accident.left": "Balzare via",
  "child_accident.left.r0": "Svelto come un gatto, ti scansi di lato.",
  "child_accident.left.r1": "Ti tuffi e rotoli — ammaccato, ma intero.",
  "child_accident.left.r2": "Non sei abbastanza svelto.",
  "child_accident.right": "Buttarti di lato",
  "child_accident.right.r0": "Sbucciato a vivo e senza fiato nel rigagnolo — ma ti rialzi vivo.",
  "child_accident.right.r1": "Non ti scansi in tempo. Le ruote non si fermano.",

  "child_hunger.prompt": "L'ultima moneta è spesa, la dispensa è vuota, e non c'è più nessun posto dove rivolgersi.",
  "child_hunger.left": "Buttarti in strada",
  "child_hunger.left.r0": "Meglio la strada aperta che il cancello della casa di lavoro. Libero, se riesci a sopravvivere.",
  "child_hunger.right": "Entrare nella casa di lavoro",
  "child_hunger.right.r0": "Baratti la tua libertà per un tetto e la pancia piena stanotte. La fatica comincia domani.",

  "child_adult.prompt": "Contro ogni previsione, arrivi ai diciotto. In tanti non ce l'hanno fatta. L'infanzia è alle spalle.",
  "child_adult.left": "Guardare indietro",
  "child_adult.left.r0": "Sei sopravvissuto. Quante cose sono già successe…",
  "child_adult.right": "Andare avanti",
  "child_adult.right.r0": "Sei arrivato fin qui. Qualunque cosa venga, sei pronto.",

  // ---- HOME: FAMILY -----------------------------------------------------
  "home_family_chores.prompt": "I tuoi genitori ti offrono la paghetta per dare una mano in casa.",
  "home_family_chores.left": "Fare le faccende",
  "home_family_chores.left.r0": "Soldi in tasca e petto in fuori — ma niente gioco.",
  "home_family_chores.right": "Andare a giocare",
  "home_family_chores.right.r0": "Divertimento e aria fresca, e un salvadanaio vuoto.",

  "home_family_sweets.prompt": "La vetrina del negozio di dolciumi: caramelle alla menta, sciroppo e liquirizia, un soldo al cartoccio.",
  "home_family_sweets.left": "Comprarne un sacchetto",
  "home_family_sweets.left.r0": "La golosità vince — ne compri il doppio e non ti penti di nulla (per ora).",
  "home_family_sweets.left.r1": "Paradiso di zucchero — un guaio per i denti e per le tasche.",
  "home_family_sweets.right": "Risparmiare i soldi",
  "home_family_sweets.right.r0": "Passare davanti ai dolciumi è un supplizio, ma la tua forza di volontà si tempra.",
  "home_family_sweets.right.r1": "Il salvadanaio cresce. Facile, quando non ti importa granché.",

  "home_family_pet.prompt": "Un gatto randagio e spelacchiato ti segue fino a casa.",
  "home_family_pet.left": "Accoglierlo",
  "home_family_pet.left.r0": "Un nuovo migliore amico che ti fa uscire all'aria aperta — spese del veterinario comprese.",
  "home_family_pet.right": "Scacciarlo",
  "home_family_pet.right.r0": "Ti risparmi la seccatura e i soldi, ma senti una fitta.",

  "home_family_market.prompt": "La mamma ti manda al mercato con gli spiccioli della settimana e una lunga lista.",
  "home_family_market.left": "Contrattare su ogni centesimo",
  "home_family_market.left.r0": "Tiri sul prezzo e torni a casa col resto. La mamma è colpita; i tuoi piedi sono a pezzi.",
  "home_family_market.right": "Concederti qualcosa per strada",
  "home_family_market.right.r0": "Un pasticcio caldo mangiato in un portone — una delizia, e un quattrino in meno.",

  "home_family_fair.prompt": "Una fiera ambulante si installa sul prato: altalene, tiro al cocco, mele caramellate.",
  "home_family_fair.left": "Spendere i tuoi spiccioli",
  "home_family_fair.left.r0": "Giostre, dolci e un mal di pancia memorabile. Vale ogni moneta.",
  "home_family_fair.right": "Guardare solo la folla",
  "home_family_fair.right.r0": "Ti tieni i soldi e ti godi tutto da dietro lo steccato. Una quieta soddisfazione.",

  "home_family_church.prompt": "Domenica, e tutta la famiglia entra nel banco col vestito buono.",
  "home_family_church.left": "Stare composto e cantare",
  "home_family_church.left.r0": "Ti perdi negli inni. Un'ora di quiete fa bene all'anima.",
  "home_family_church.right": "Agitarti e sognare a occhi aperti",
  "home_family_church.right.r0": "Conti le travi e fai le boccacce al bimbo dietro — ma la predica non finisce mai.",

  "home_family_relative.prompt": "È in visita una zia benestante, piena di opinioni e, forse, di uno scellino di troppo.",
  "home_family_relative.left": "Fare il lecchino",
  "home_family_relative.left.r0": "Uno scellino ti finisce in mano — guadagnato con parecchi 'sì, zia'.",
  "home_family_relative.right": "Dire la tua",
  "home_family_relative.right.r0": "Dici quel che pensi. Niente scellino, ma la mamma nasconde un sorriso e ti senti alto un metro e ottanta.",

  "home_family_scrump.prompt": "Il muro del frutteto è basso, le mele sono mature e il cane del contadino dorme.",
  "home_family_scrump.left": "Scavalcare il muro",
  "home_family_scrump.left.r0": "Tasche piene di mele rubate e una manica strappata — un banchetto glorioso e colpevole.",
  "home_family_scrump.right": "Resistere alla tentazione",
  "home_family_scrump.right.r0": "Tiri dritto. Più affamato e un po' compiaciuto, ma con la coscienza pulita.",

  "home_family_moveout.prompt": "Hai messo da parte abbastanza per l'anticipo di un alloggio tutto tuo. È ora di lasciare il nido?",
  "home_family_moveout.left": "Andare via",
  "home_family_moveout.left.r0": "Un appartamentino angusto in affitto, una chiave tutta tua e nessuno a cui rendere conto. Ti è costato quasi tutto — ne è valsa la pena.",
  "home_family_moveout.right": "Restare a casa",
  "home_family_moveout.right.r0": "Il gruzzolo resta dov'è, e anche tu. Per ora.",

  // ---- HOME: RENTING ----------------------------------------------------
  "deck.home_renting.title": "Casa tua",
  "deck.home_renting.blurb": "Una chiave tutta tua e un libretto d'affitto da riempire. Nessuno a cui rendere conto — finché paghi la pigione.",

  "home_renting_lodger.prompt": "Di nuovo il giorno dell'affitto, e la stanzetta è vuota. Potresti prendere un inquilino.",
  "home_renting_lodger.left": "Prendere un inquilino",
  "home_renting_lodger.left.r0": "L'affitto si dimezza, ma anche la tua pace e tranquillità.",
  "home_renting_lodger.right": "Tenerla per te",
  "home_renting_lodger.right.r0": "Le tue quattro mura, indisturbate — e tutto l'affitto sulle tue spalle.",

  "home_renting_landlord.prompt": "Il padrone di casa bussa: l'affitto aumenta, dice, coi tempi che corrono.",
  "home_renting_landlord.left": "Pagare l'aumento",
  "home_renting_landlord.left.r0": "Stringi i denti e paghi. Almeno il tetto resta sopra la testa.",
  "home_renting_landlord.right": "Minacciare di andartene",
  "home_renting_landlord.right.r0": "Bluffi — e lui cede. Da batticuore, ma l'affitto tiene.",

  "home_renting_furnish.prompt": "L'appartamento è spoglio e rimbomba. Un carretto al mercato ha mobili usati a poco prezzo.",
  "home_renting_furnish.left": "Sistemare la casa",
  "home_renting_furnish.left.r0": "Un tappeto, una lampada, una sedia decente — finalmente sembra casa.",
  "home_renting_furnish.right": "Arrangiarti con le casse",
  "home_renting_furnish.right.r0": "Una cassetta per tavolo e un chiodo per il cappotto. Economico, e squallido.",

  "home_renting_neighbour.prompt": "La coppia sul pianerottolo passa a invitarti a cena.",
  "home_renting_neighbour.left": "Unirti a loro",
  "home_renting_neighbour.left.r0": "Una serata calda di stufato e chiacchiere — porti qualcosina anche tu.",
  "home_renting_neighbour.right": "Declinare",
  "home_renting_neighbour.right.r0": "Una serata presto a letto e un borsellino intatto — ma senti l'aria fredda.",

  "home_renting_quiet.prompt": "Una rara sera libera, con nient'altro che le tue quattro mura e il fuoco.",
  "home_renting_quiet.left": "Riposare accanto al fuoco",
  "home_renting_quiet.left.r0": "Ti rimetti, sonnecchi, respiri — tranquillo, se un po' solo.",
  "home_renting_quiet.right": "Fuori in città",
  "home_renting_quiet.right.r0": "Gin, canzoni e cattive decisioni. Una gran serata — la pagherai domani.",

  // ---- HOME: WORKHOUSE --------------------------------------------------
  "home_workhouse_gruel.prompt": "La cena è una scodella di brodaglia, e la pancia ti fa ancora male. Il pentolone non è del tutto vuoto.",
  "home_workhouse_gruel.left": "Chiederne ancora",
  "home_workhouse_gruel.left.r0": "Il direttore diventa paonazzo — 'ANCORA?!' — ma un inserviente gentile ti passa un tozzo di pane nella ressa.",
  "home_workhouse_gruel.right": "Farne a meno",
  "home_workhouse_gruel.right.r0": "Ingoi la fame e l'orgoglio insieme. Almeno nessuno urla.",

  "home_workhouse_oakum.prompt": "Dodici ore a sfilacciare stoppa — a disfare corda incatramata finché i polpastrelli sono a vivo. C'è un soldo per ogni cesto pieno.",
  "home_workhouse_oakum.left": "Raggiungere la quota",
  "home_workhouse_oakum.left.r0": "Dita sanguinanti e schiena a pezzi — ma qualche moneta verso il riscatto della tua libertà.",
  "home_workhouse_oakum.right": "Sabotare per protesta",
  "home_workhouse_oakum.right.r0": "Una piccola, segreta ribellione — vale la cella fredda e la cena saltata.",

  "home_workhouse_friend.prompt": "Nella branda accanto, un bambino misero quanto te ti offre un'amicizia sussurrata dopo il coprifuoco.",
  "home_workhouse_friend.left": "Rispondere sottovoce",
  "home_workhouse_friend.left.r0": "Due cospiratori contro il buio. Ridi per la prima volta da settimane — e perdi un'ora di sonno.",
  "home_workhouse_friend.right": "Restare per conto tuo",
  "home_workhouse_friend.right.r0": "Più prudente, e più solo. Risparmi le forze e passi le sere da solo.",

  "home_workhouse_sunday.prompt": "Domenica. Un'ora di cappella — l'unica pausa nella settimana grigia — e un inno che conosci davvero.",
  "home_workhouse_sunday.left": "Cantare a squarciagola",
  "home_workhouse_sunday.left.r0": "Per qualche minuto la miseria si solleva e la tua voce riecheggia sulla pietra fredda.",
  "home_workhouse_sunday.right": "Sonnecchiare in fondo",
  "home_workhouse_sunday.right.r0": "Rubi un po' di riposo nel caldo pigia-pigia dei corpi — e non provi granché.",

  "home_workhouse_matron.prompt": "La sorvegliante, dura come pietra focaia, prende una simpatia inaspettata per te.",
  "home_workhouse_matron.left": "Fare il beniamino",
  "home_workhouse_matron.left.r0": "Pane in più e un angolo più caldo — comprati con parecchi inchini e leccate di piedi.",
  "home_workhouse_matron.right": "Tenere la dignità",
  "home_workhouse_matron.right.r0": "Non ti umili per nessuno. Lei si stanca presto di te — ma puoi ancora guardarti allo specchio.",

  "home_workhouse_buyout.prompt": "Hai messo da parte giusto abbastanza. Il direttore cancellerà il tuo nome dal registro — a un prezzo.",
  "home_workhouse_buyout.left": "Comprare la libertà",
  "home_workhouse_buyout.left.r0": "Monete contate sul tavolo, e il cancello si spalanca. Una stanzetta angusta in affitto, ma è tua.",
  "home_workhouse_buyout.right": "Continuare a risparmiare",
  "home_workhouse_buyout.right.r0": "Non ancora — riponi le monete e aspetti un giorno migliore.",

  "home_workhouse_runaway.prompt": "Un cancello laterale è rimasto aperto nel grigiore prima dell'alba. Potresti semplicemente… andartene.",
  "home_workhouse_runaway.left": "Scappare",
  "home_workhouse_runaway.left.r0": "Col cuore in gola, scatti — e non ti fermi finché la casa di lavoro non è lontana. Libero, e completamente solo.",
  "home_workhouse_runaway.right": "Restare",
  "home_workhouse_runaway.right.r0": "Il rischio è troppo grande, il mondo là fuori troppo freddo. Torni mogio alla tua branda.",

  "home_workhouse_apprentice.prompt": "Un artigiano di passaggio cerca un paio di mani volenterose, e prenderà un apprendista a carico della parrocchia.",
  "home_workhouse_apprentice.left": "Firmare il contratto",
  "home_workhouse_apprentice.left.r0": "Un mestiere, il tetto di un maestro e un futuro da costruire. I cancelli della casa di lavoro si chiudono alle tue spalle per sempre.",
  "home_workhouse_apprentice.right": "Lasciar perdere",
  "home_workhouse_apprentice.right.r0": "Non questo. Guardi l'artigiano andarsene, e speri che ne arrivi un altro.",

  // ---- EDUCATION: BASIC SCHOOL -----------------------------------------
  "edu_basicschool_exams.prompt": "Si avvicinano gli esami importanti, e il maestro si aspetta grandi cose.",
  "edu_basicschool_exams.left": "Studiare sodo",
  "edu_basicschool_exams.left.r0": "I libri vengono facili a un lettore nato — voti eccellenti, e ti sei pure divertito.",
  "edu_basicschool_exams.left.r1": "Voti eccellenti — conquistati con stress e notti insonni.",
  "edu_basicschool_exams.right": "Andare a caso",
  "edu_basicschool_exams.right.r0": "Rilassato e ben riposato, ma i risultati bruciano.",

  "edu_basicschool_crush.prompt": "Il tuo cuore fa qualcosa di strano quando un certo compagno di classe ti passa accanto.",
  "edu_basicschool_crush.left": "Salutare",
  "edu_basicschool_crush.left.r0": "Ti sorride! Farfalle nello stomaco, e poco sonno.",
  "edu_basicschool_crush.right": "Farsi prendere dal panico",
  "edu_basicschool_crush.right.r0": "Ti nascondi dietro il carbonile. Imbarazzante — ma il panico passa presto.",

  "edu_basicschool_friend.prompt": "Il nuovo allievo cerca qualcuno con cui dividere il banco.",
  "edu_basicschool_friend.left": "Fargli cenno",
  "edu_basicschool_friend.left.r0": "Un amico meraviglioso — anche se ti perdi un po' in lui.",
  "edu_basicschool_friend.right": "Guardare altrove",
  "edu_basicschool_friend.right.r0": "Un trimestre più solitario, ma impari a cavartela con le tue gambe.",

  "edu_basicschool_prize.prompt": "Giorno della premiazione. La medaglia per il miglior allievo è a portata di mano.",
  "edu_basicschool_prize.left": "Sgobbare per averla",
  "edu_basicschool_prize.left.r0": "Hai già letto metà del programma per piacere — la medaglia è tua, senza fatica.",
  "edu_basicschool_prize.left.r1": "La medaglia è tua — appuntata tra educati applausi.",
  "edu_basicschool_prize.right": "Lasciar stare",
  "edu_basicschool_prize.right.r0": "Preferisci giocare all'aperto che stare sepolto tra i libri.",

  "edu_basicschool_errands.prompt": "Un bottegaio paga un bambino per fare le consegne dopo le lezioni.",
  "edu_basicschool_errands.left": "Fare il giro",
  "edu_basicschool_errands.left.r0": "Gambe stanche e compiti non fatti — ma monete in tasca.",
  "edu_basicschool_errands.right": "Dritto a casa",
  "edu_basicschool_errands.right.r0": "Ti tieni le sere per il riposo e i libri — e resti al verde.",

  "edu_basicschool_leaver.prompt": "Sei arrivato alla fine della scuola e hai ottenuto il tuo attestato. E adesso?",
  "edu_basicschool_leaver.left": "Restare a studiare",
  "edu_basicschool_leaver.left.r0": "Andrai avanti verso un'istruzione vera — ancora un po' di lavagna e gesso.",
  "edu_basicschool_leaver.right": "Cercare lavoro",
  "edu_basicschool_leaver.right.r0": "Via i libri, berretto in testa. È ora di andare a guadagnarti da vivere.",

  // ---- JOB: UNEMPLOYED --------------------------------------------------
  "deck.job_unemployed.title": "Senza lavoro",
  "deck.job_unemployed.blurb": "La scuola è alle spalle e il mondo davanti — ma niente paga in tasca, per ora. È ora di trovare lavoro.",
  "job_unemployed_offer.prompt": "Si sparge la voce che cerchi lavoro, e ci sono due posti liberi.",
  "job_unemployed_offer.left": "Il bancone del negozio",
  "job_unemployed_offer.left.r0": "Dietro il bancone del negozio all'angolo — rispettabile, sicuro, e tuo.",
  "job_unemployed_offer.right": "Il reparto della fabbrica",
  "job_unemployed_offer.right.r0": "La fabbrica: più rumorosa, più dura, e meglio pagata.",
  "job_unemployed_offer.down": "Aspettare di meglio",
  "job_unemployed_offer.down.r0": "Non questi due. Continuerai a cercare ancora un po'.",
  "job_unemployed_idle.prompt": "Un altro giorno a battere le strade, berretto in mano, senza lavoro in vista.",
  "job_unemployed_idle.left": "Continuare a bussare",
  "job_unemployed_idle.left.r0": "Piedi pieni di vesciche e orgoglio ammaccato, ma tieni alte le speranze.",
  "job_unemployed_idle.right": "Riposarti oggi",
  "job_unemployed_idle.right.r0": "Metti i piedi in alto — e senti il peso di una giornata oziosa.",

  // ---- JOB: LABOUR ------------------------------------------------------
  "job_labour_machine.prompt": "Il capoccia ti fa cenno di infilarti sotto il telaio rombante per liberare un inceppo.",
  "job_labour_machine.left": "Infilare la mano",
  "job_labour_machine.left.r0": "Dita agili e svelte — l'inceppo si libera, nessun danno.",
  "job_labour_machine.left.r1": "Un brutto taglio sulla mano, ma te la cavi.",
  "job_labour_machine.left.r2": "La macchina non si ferma per nessuno.",
  "job_labour_machine.right": "Rifiutare",
  "job_labour_machine.right.r0": "Il capoccia ti taglia la paga e ti molla uno scappellotto.",

  "job_labour_wages.prompt": "Venerdì, e il capoccia conta la tua paga.",
  "job_labour_wages.left": "Tutto alla famiglia",
  "job_labour_wages.left.r0": "Ogni centesimo nel bilancio di famiglia. Sono fieri di te.",
  "job_labour_wages.right": "Tenerne un po'",
  "job_labour_wages.right.r0": "Un soldo di nascosto per te — in colpa, ma contento.",

  // ---- SIBLING (brother = r0, sister = r1) ------------------------------
  "sibling_play.prompt": "Il tuo fratellino ti implora di andare a giocare.",
  "sibling_play.left": "Stare al gioco",
  "sibling_play.left.r0": "Costruite insieme un forte di coperte epico. Migliori amici.",
  "sibling_play.left.r1": "Costruite insieme un forte di coperte epico. Migliori amiche.",
  "sibling_play.right": "Stuzzicarlo",
  "sibling_play.right.r0": "Nascondi il suo giocattolo preferito. Scoppia il finimondo.",
  "sibling_play.right.r1": "Nascondi il suo giocattolo preferito. Scoppia il finimondo.",

  "sibling_blame.prompt": "Qualcosa si è rotto, e un genitore pretende di sapere chi è stato.",
  "sibling_blame.left": "Prendersi la colpa",
  "sibling_blame.left.r0": "Copri tuo fratello. Non se lo dimentica mai.",
  "sibling_blame.left.r1": "Copri tua sorella. Non se lo dimentica mai.",
  "sibling_blame.right": "Fare la spia",
  "sibling_blame.right.r0": "Fai la spia su tuo fratello. Tu la scampi — lui no.",
  "sibling_blame.right.r1": "Fai la spia su tua sorella. Tu la scampi — lei no.",

  "sibling_treat.prompt": "È rimasto esattamente un biscotto nella scatola.",
  "sibling_treat.left": "Dividerlo equamente",
  "sibling_treat.left.r0": "Metà a testa, senza discussioni. Tuo fratello sorride.",
  "sibling_treat.left.r1": "Metà a testa, senza discussioni. Tua sorella sorride.",
  "sibling_treat.right": "Mangiarlo tutto",
  "sibling_treat.right.r0": "Delizioso. Tuo fratello è furioso.",
  "sibling_treat.right.r1": "Delizioso. Tua sorella è furiosa.",

  // ---- DECK unlock announcements ---------------------------------------
  "deck.childhood.title": "L'infanzia",
  "deck.childhood.blurb": "Ora sei un bambino — un mondo intero di ginocchia sbucciate, amici del cuore e brutti colpi ti aspetta.",
  "deck.home_workhouse.title": "La casa di lavoro",
  "deck.home_workhouse.blurb": "Pietra fredda, brodaglia e il fragore incessante del lavoro. Ora è qui che vivi — finché non trovi una via d'uscita.",
  "deck.sibling.title": "Il tuo fratellino",
  "deck.sibling.blurb": "Ora hai un piccolo compagno — complice o spina nel fianco. Dipende da te.",

  // ---- STATUS state labels ---------------------------------------------
  "status.job.infant": "Nessuno",
  "status.job.child_labourer": "Bambino operaio",
  "status.job.studying": "Scolaro",
  "status.job.apprentice": "Apprendista",
  "status.job.unemployed": "Disoccupato",
  "status.job.shophand": "Commesso",
  "status.job.factory": "Operaio",
  "status.housing.family": "In famiglia",
  "status.housing.workhouse": "Casa di lavoro",
  "status.housing.renting": "In affitto",
  "status.housing.homeless": "Senzatetto",
  "status.housing.apprentice": "Da un maestro",
  "status.education.none": "Analfabeta",
  "status.education.school": "Istruzione di base",

  // ---- STATUS kind (chip prefix) ---------------------------------------
  "statuskind.job": "Lavoro",
  "statuskind.housing": "Casa",
  "statuskind.education": "Istruzione",
  "statuskind.lifestyle": "Vita",

  // ---- VITALS -----------------------------------------------------------
  "vital.finances": "Finanze",
  "vital.happiness": "Felicità",
  "vital.health": "Salute",
  "vital.spirit": "Spirito",

  // ---- ENDINGS ----------------------------------------------------------
  "ending.finances.title": "In rovina",
  "ending.finances.blurb": "I soldi sono finiti, e con loro le tue possibilità.",
  "ending.happiness.title": "Disperazione",
  "ending.happiness.blurb": "La gioia si è prosciugata finché non ne è rimasta più da trovare.",
  "ending.health.title": "Morte",
  "ending.health.blurb": "Il tuo corpo ha ceduto. Una vita è giunta alla fine.",
  "ending.spirit.title": "Vuoto",
  "ending.spirit.blurb": "La scintilla si è spenta. Eri ancora qui, ma non davvero.",
  "ending.grown_up.title": "Sei sopravvissuto all'infanzia",
  "ending.grown_up.blurb": "Metà della tua strada non ha visto i diciott'anni — ma tu sì. Il resto della tua storia è ancora da scrivere…",

  // ---- UI chrome --------------------------------------------------------
  "ui.yearsOld": "anni",
  "ui.easy": "Facile",
  "ui.easyTip": "Modalità facile: mostra l'effetto di ogni scelta sulle statistiche",
  "ui.debug": "Debug",
  "ui.debugTip": "Attiva/disattiva le info di debug",
  "ui.reset": "Azzera",
  "ui.resetTip": "Debug: cancella il salvataggio e inizia una nuova vita",
  "ui.newborn": "Neonato",
  "ui.age": "{n} anni",
  "ui.tapContinue": "Tocca per continuare",
  "ui.tapBegin": "Tocca per iniziare",
  "ui.newChapter": "Un nuovo capitolo",
  "ui.reachedYears": "Sei arrivato a <b>{n}</b> anni.",
  "ui.newLife": "Nuova vita",
  "ui.bornBoy": "Nato maschio",
  "ui.bornGirl": "Nata femmina",
  "ui.recapMartial": "Ha imparato a combattere",
};

const STRINGS = { en: EN, it: IT } as const;
export type Locale = keyof typeof STRINGS;
export const LOCALES: { code: Locale; name: string }[] = [
  { code: "en", name: "English" },
  { code: "it", name: "Italiano" },
];

const LANG_KEY = "cardsoflife.lang";

function loadLocale(): Locale {
  try {
    const s = localStorage.getItem(LANG_KEY);
    if (s === "en" || s === "it") return s;
  } catch {
    /* storage may be unavailable */
  }
  return "en";
}

let locale: Locale = loadLocale();

export function getLocale(): Locale {
  return locale;
}

export function setLocale(l: Locale): void {
  locale = l;
  try {
    localStorage.setItem(LANG_KEY, l);
  } catch {
    /* ignore */
  }
}

// Look up a string in the current locale, falling back to English then the id.
export function t(id: StringId): string {
  return (STRINGS[locale] as Record<string, string>)[id] ?? EN[id] ?? id;
}

// Like t(), but substitutes {name} placeholders.
export function tf(id: StringId, vars: Record<string, string | number>): string {
  let s = t(id);
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}
