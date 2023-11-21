//Enemy
    class EnemyObj {
        constructor(){
            this.level = gs.stage //tileIdRef[1] prev. value.
            
            //Misc
            this.poisonStacks = 0
            this.crit = false
            this.state = '' //Used for stun, fear etc.

            this.actionRef = []
            this.acctionMod = ''

            //Choose enemy profile
            let profiles = 'balanced, tank, assassin'.split(', ') //, tank, assassin, minion
            let randomEnemyProfile = rarr(profiles)
            let powerMod, defMod, diceMod, imgPath, lifeMod
            // el('enemyImg').classList.remove('boss')

            if      (randomEnemyProfile == 'balanced'){
                lifeMod  = 1
                powerMod = 1
                defMod   = 1
                diceMod  = 1

                this.profile = 'balanced'
                imgPath  = `balanced/${rng(17,1)}` //Sprite builder is now in ui.js

            }else if(randomEnemyProfile == 'tank'){
                lifeMod  = 1.5
                powerMod = 0.5
                defMod   = 3.5
                diceMod  = 0.5

                this.profile = 'tank'
                imgPath  = `tank/${rng(1,1)}`

            }else if(randomEnemyProfile == 'assassin'){
                lifeMod  = 1.2
                powerMod = 1.5
                defMod   = 0.5
                diceMod  = 1

                this.profile = 'assassin'
                imgPath  = `assassin/${rng(1,1)}`

            }else if(randomEnemyProfile == 'minion'){
                lifeMod  = 0.7
                powerMod = 0.5
                defMod   = 0.5
                diceMod  = 0.5

                this.profile = 'minion'
                imgPath  = `minion/${rng(1,1)}`
                
            }

            //Set boss mods
            // if(gs.stage % gs.bossFrequency === 0){//boss
            //     // lifeMod  += 0.5
            //     // powerMod += 0.25
            //     // defMod   += 0.25
            //     // diceMod  += 0.25

            //     this.profile = 'boss'
            // }

            //Set stats
            //Get column value to scale mobs
            let tileIdRef = []
            gs.playerLocationTile.tileId.split('-').forEach(val =>{
                tileIdRef.push(parseInt(val))
            })

            // mod(0.5) -> Get +1 every 2 stages
            this.life        = 0 + Math.round((config.eneLife   + this.level) * lifeMod )
            this.flatLife    = this.life
            this.dmgDone     = 0 // For dmg calc.
            this.dmgTaken    = 0 // For dmg calc.
            this.lifeChange  = 0
            this.lifeChangeMarker = false

            this.power       = 0 + Math.round((0.2 * this.level) * powerMod) 
            this.flatPower   = this.power
            this.powerChange = 0
            this.powerChangeMarker = false

            this.def         = 0 + Math.round((0.2 * this.level) * defMod)
            this.flatDef     = this.def
            this.defChange   = 0
            this.defChangeMarker = false

            this.dice        = 4 + Math.round((0.2 * this.level) * diceMod)
            this.flatDice    = this.dice 
            this.diceChange  = 0
            this.diceChangeMarker = false

            this.roll        = 0
            this.rollChange  = 0
            this.rollChangeMarker = false
        }
    }

    class EnemyActionObj {
        constructor(key){

            //Gen icon path
            function ico(icoKey){
                let path = `<img src="./img/ico/${icoKey}.svg">`
                return path
            }

            this.key = key

            //Damage
            if      (key == 'attack'){

                this.rate = 1
                this.actionVal = gs.enObj.roll + gs.enObj.power 
                // this.desc = `${ico('attack')}${this.actionVal} dmg`
                this.desc = `${ico('attack')}Will attack for ${this.actionVal}`

            }else if(key == 'combo'){       //multistrike

                this.rate = 2
                this.actionVal = 1 + gs.enObj.power 
                this.desc = `${ico('combo')}Will attack 3<br>times for ${this.actionVal}`

            }else if(key == 'block'){

                this.rate = 1
                this.actionVal = gs.enObj.roll
                this.desc = `${ico("block")}Will block ${this.actionVal} dmg`

            }else if(key == 'final strike'){//on death

                //Enable if low life
                if(gs.enObj.life < 3){
                    this.rate = 1
                }

                this.actionVal = gs.enObj.flatLife
                this.desc = `${ico('skull') + this.actionVal} dmg on death`

            }else if(key == 'charge'){      //charge crit

                this.rate = 3
                this.actionVal = rng(3)
                this.desc = `Charges an attack (${this.actionVal} turns)`

            }else if(key == 'charged strike'){

                this.actionVal = (gs.enObj.dice * 2) + gs.enObj.power
                this.desc = `Charged strike ${this.actionVal} dmg`

            }
            
            //Buff
            else if (key == 'fortify'){//+ def

                this.rate = 2
                this.stat = 'def'
                this.actionVal = Math.ceil((gs.enObj.roll) * 0.5)

                //Enable recovery if def is negative.
                if(gs.enObj.def < 0){
                    this.rate = 1
                    this.actionVal = gs.enObj.flatDef - gs.enObj.def
                }

                this.desc = `${ico('def-buff')} Will gain ${this.actionVal} def`

            }else if(key == 'empower'){//+ power

                this.rate = 3
                this.stat = 'power'
                this.actionVal = Math.round((gs.enObj.roll + gs.stage) *0.25)

                //Enable recovery if def is negative.
                if(gs.enObj.power < 0){
                    this.rate = 1
                    this.actionVal = gs.enObj.flatPower - gs.enObj.power
                }

                this.desc = `${ico('power-buff')} Will gian ${this.actionVal} power`

            }else if(key == 'rush'){   //+ dice

                this.rate = 3
                this.stat = 'dice'
                this.actionVal = Math.round(1 + (gs.stage) *0.2)

                //Enable recovery if def is negative.
                if(gs.enObj.dice < gs.enObj.flatDice){
                    this.rate = 1
                    this.actionVal = gs.enObj.flatDice - gs.enObj.dice
                }

                this.desc = `${ico('dice-buff')}Will increse dice by ${this.actionVal}`

            }else if(key == 'recover'){//+ life

                //Enable if life lost
                if(gs.enObj.flatLife > gs.enObj.life){
                    this.rate = 2
                }

                this.stat = 'life'
                this.actionVal = gs.enObj.roll * 2
                this.desc = `${ico('life-buff')}Will heal for ${this.actionVal}`

            }

            //Curse
            else if (key == 'wound'){  //- def

                this.rate = 3
                this.stat = 'def'
                this.actionVal = Math.ceil((gs.enObj.roll) * 0.25)
                this.desc = `${ico('curse-def')}Will reduce your<br>def by ${this.actionVal}`

            }else if(key == 'weaken'){ //- power

                this.rate = 2
                this.stat = 'power'
                this.actionVal = Math.round((gs.enObj.roll + gs.stage) *0.25)
                this.desc = `${ico('curse-power')}Will reduce your<br>power by ${this.actionVal}`

            }else if(key == 'slow'){   //- dice

                this.rate = 5
                this.stat = 'dice'
                this.actionVal = rng(2)
                this.desc = `${ico('curse-dice')}Will reduce your<br>dice by ${this.actionVal}`

            }else if(key == 'drain'){  //- life

                this.rate = 4
                this.stat = 'life'
                this.actionVal = Math.round(gs.enObj.roll * 1.5)
                this.desc = `${ico('curse-life')}Will reduce your<br>life by ${this.actionVal}`

            }

            //Misc
            else if (key == 'sleep'){
                let dialogueOptions = [
                    'Surrender!',
                    'Your end nears...',
                    "Accept your fate!",
                    "No mercy!",
                    "Feel my wrath!",
                    "You won't survive!",
                    "Surrender now!",
                    "Face oblivion!",
                    "Meet your doom!",
                    "Bow before me!",
                    "Prise the Hecatocore!",
                    "Dance, fool, dance!",
                    "My blade hungers.",
                    "Annihilation!",
                    "Chaos embraces you.",
                    "Face the nightmare.",
                    "SUFFER!",
                    "Hope is a lie.",
                    "Meet your reckoning.",
                    "Why so serious?",
                    "Face the truth!",
                    "Your head is mine!",
                ]
                this.rate = 3
                this.desc = `
                    <span class="italic">"${dialogueOptions[rng(dialogueOptions.length -1)]}"</span>
                    <span class="w50">(will skip turn)</span>
                `
            }
            
            //Debuff player item
            //     // "poi att":  {rate:1,   desc: `Will attack with poison for ${dmgVal}`},
            //     // "fire att": {rate:1,   desc: `Will attack with fire for ${dmgVal}`},
            //     // "def break":{rate:1,   desc: `Will reduce your def by ${dmgVal}`},
            //     // "buff":     {rate:1,   desc: `Will use random buff spell`},
            //     // "debuff":   {rate:1,   desc: `Will use random debuff spell`},
            //     // "recruits": {rate:1,   desc: `Will call reinforcements`},

            //     // "spell":    {rate:1,   desc: `Will cast a <random spell>`},
            //     // "reflect":  {rate:1,   desc: `Will reflect any spell or attack to character that targets this`},
            //     // "disarm":   {rate:1,   desc: `Will steal item used against it during the next turn`},
            //     // "theft":    {rate:1,   desc: `Will steal random item`},   
            //     // "command":  {rate:1,   desc: `Will redirect actions of all enemies on you`},
            //     // "consume":  {rate:1,   desc: `Enemy will consume a random consumable from targets inventory`},
            //     // "escape":   {rate:1,   desc: `Will escape`},  
        }
    }

//From main.js
    //Enemy action logic
    function enemyActionLogic(){
        //State checkd. Deals with stun and extra actions.
        if(gs.enObj.state == 'Skip turn') return                         gs.logMsg.push(`enemy skipped turn due to stun`)
        if(gs.sourceAction.actionType == "extra-action") return gs.logMsg.push(`enemy skipped turn due to extra action`)

        //Resolve actions.
        if      ('attack, combo, final strike, charged strike'.slice(', ').indexOf(gs.enObj.action.key) > -1){

            gs.enObj.dmgDone += gs.enObj.action.actionVal

        }else if('block'.slice(', ').indexOf(gs.enObj.action.key) > -1){

            gs.plObj.dmgDone -= gs.enObj.action.actionVal

        }else if('recover, rush, empower, fortify'.slice(', ').indexOf(gs.enObj.action.key) > -1){

            //Resolve stat change
            changeStat(gs.enObj.action.stat, gs.enObj.action.actionVal, 'enemy')

        }else if('wound, weaken, slow, drain'.slice(', ').indexOf(gs.enObj.action.key) > -1){   

            //Resolve stat change
            changeStat(gs.enObj.action.stat, -gs.enObj.action.actionVal, 'player')

        }
        
        //Records previous action for ui updates.
        gs.enemyAction = gs.enObj.action 
    }

    //Pick enemy action
    function genEneAction(){

        
        //Next turn roll
        gs.enObj.roll = rng(gs.enObj.dice)         

        //Generate action refs with proper calculation for this roll
        let actionKeys = [
            'attack', 
            'final strike', 
            'combo', 
            // 'charge', 
            'block', 
            'fortify', 
            'empower', 
            // 'rush', 
            'recover', 
            'wound', 
            // 'weaken', 
            // 'slow', 
            'drain', 
            'sleep'
        ]

        
        //Generates all enemy actions.
        gs.enObj.actionRef = []
        actionKeys.forEach(key => {gs.enObj.actionRef.push(new EnemyActionObj(key))})

        //Pick action
        let actionRoll = rng(100)           //Roll for action chance.

        //Prevent action selection if enemy is charging an attack.
        if(gs.enObj.action != undefined && gs.enObj.action.key == 'charge'){
            
            gs.enObj.action.actionVal--
            gs.enObj.action.desc = `Charges an attack (${ gs.enObj.action.actionVal} turns)`

            //Switch action to charged strike on cd 0
            if(gs.enObj.action.actionVal < 1){
                gs.enObj.action = new EnemyActionObj('charged strike')
            }

        }else if(actionRoll < 2){           //R5: 1%

            gs.enObj.action = rarr(gs.enObj.actionRef.filter(action => action.rate == 5))

        }else if(actionRoll < 7){           //R4: 5%

            gs.enObj.action = rarr(gs.enObj.actionRef.filter(action => action.rate == 4))

        }else if(actionRoll < 25){          //R3: 18%

            gs.enObj.action = rarr(gs.enObj.actionRef.filter(action => action.rate == 3))

        }else if(actionRoll < 55){          //R2: 30% 

            gs.enObj.action = rarr(gs.enObj.actionRef.filter(action => action.rate == 2))

        }else{                              //R1: 45%

            gs.enObj.action = rarr(gs.enObj.actionRef.filter(action => action.rate == 1))

        }

        //Log: next enemy action.
        // console.log(gs.enObj.action);

        //Resolve fear.
        if(gs.enObj.state == 'fear'){
            gs.enObj.action = new EnemyActionObj('block')
            gs.enObj.state = ''
        }
        
        //Resolve undefined actions due to lack of rate.
        if(gs.enObj.action === undefined) {
            gs.enObj.action = rarr(gs.enObj.actionRef.filter(action => action.rate == 1))
        }
    }

    //Recalculate current action.
    function recalcEneAction(){
        gs.enObj.action = new EnemyActionObj(gs.enObj.action.key)
        gs.logMsg.push(`enemy action recalculated`)
    }