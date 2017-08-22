function dragonBattle() {
    var slaying = true;
    var dragonHealth = 20;
    var playerHealth = 20;
    var dragonDamage = 0;
    var playerDamage = 0;
    var response = "";
    var damageDealtToDragon = 0;
    var damageDealtToPlayer = 0;

    // conjunction functions, what's your luck son?
    function randomNumber(a, b) {
        return (Math.floor(Math.random() * a) + b);
    }

    function randomResponse(prefix, responseNumber) {
        var i = randomNumber(responseNumber, 0);
        response = prefix[i];
    }

    function healthToPercent(health) {
        health = Math.floor(((health / 20) * 100));
        if (health < 0) {
            return "0%";
        }
        return health + "%";
    }

    // Battle Round Summary
    function roundSummary(youHit, response, dragonDamage, playerDamage, dragonHealth, playerHealth) {
        if (dragonHealth < 0) {
            dragonHealth = 0;
        }
        if (playerHealth < 0) {
            playerHealth = 0;
        }

        alert((youHit ? "You hit the dragon" : "The dragon hit you") + ", and did " + (dragonDamage ? dragonDamage : playerDamage) + " damage. " + "\n" + response + "\n\nHealth => Dragon: " + dragonHealth + " | You: " + playerHealth + "\n\n");
    }

    //this begins the battle for middle earth
    while (slaying) {
        // sets whether you hit the dragon or not
        var youHit = randomNumber(2, 0);

        if (dragonHealth <= 0) {
            return killedTheDragon();
        } else if (playerHealth <= 0) {
            return youWereKilled();
        } else if (youHit) {
            randomResponse(chapterTwo.battle.dragon.hit, 5);
            damageDealtToDragon = randomNumber(5, 1);
            dragonDamage += damageDealtToDragon;
            playerDamage = 0;
        } else {
            randomResponse(chapterTwo.battle.dragon.missed, 5);
            damageDealtToPlayer = randomNumber(5, 1);
            playerDamage += damageDealtToPlayer;
            dragonDamage = 0;
        }

        dragonHealth -= dragonDamage;
        playerHealth -= playerDamage;

        dragonHealthPercent = healthToPercent(dragonHealth);
        playerHealthPercent = healthToPercent(playerHealth);

        roundSummary(youHit, response, dragonDamage, playerDamage, dragonHealthPercent, playerHealthPercent);
    }
}

var killedTheDragon = function() {
    alert(chapterTwo.deadDragon);
    escapeTheCave(true);
};

function youWereKilled() {
    alert(chapterTwo.retreatFromDragon);
    escapeTheCave(false);
}
