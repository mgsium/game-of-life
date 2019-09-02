class Visualtisation{
    constructor(){
        this.houses = []
    }
    addHouse(id){ this.houses.push(id) };
    removeHouse(id){ this.houses.splice(this.houses.indexOf(id), 1) };
}

let Game = new Visualtisation();

let checkNeighbours = async (placesToCheck) => {
    let len = placesToCheck.length;

    let newHouseList = [];

    for (let i = 0; i < len; i++){

        let neighbours = 0;
        const y = placesToCheck[i].split("-")[0];
        const x = placesToCheck[i].split("-")[1];

        Game.houses.includes(`${parseInt(y, 10)+1}-${parseInt(x, 10)}`) ? neighbours++ : null; // up
        Game.houses.includes(`${parseInt(y, 10)+1}-${parseInt(x, 10)+1}`) ? neighbours++ : null; // north-east
        Game.houses.includes(`${parseInt(y, 10)}-${parseInt(x, 10)+1}`) ? neighbours++ : null; // right
        Game.houses.includes(`${parseInt(y, 10)-1}-${parseInt(x, 10)+1}`) ? neighbours++ : null; // south-east
        Game.houses.includes(`${parseInt(y, 10)-1}-${parseInt(x, 10)}`) ? neighbours++ : null; // bottom
        Game.houses.includes(`${parseInt(y, 10)-1}-${parseInt(x, 10)-1}`) ? neighbours++ : null; // south-west
        Game.houses.includes(`${parseInt(y, 10)}-${parseInt(x, 10)-1}`) ? neighbours++ : null; // left
        Game.houses.includes(`${parseInt(y, 10)+1}-${parseInt(x, 10)-1}`) ? neighbours++ : null; // north-west

        // console.log(neighbours);
        console.log(neighbours);

        let id = `${y}-${x}`;

        if($(`#${id}`).hasClass("house")){
             if(neighbours == 3 || neighbours == 2) newHouseList.push(id);
         } else {
            if(neighbours == 3) newHouseList.push(id);
         }  
    }
    Game.houses.forEach((elem) => {$(`#${elem}`).removeClass("house")});
    
    Game.houses = newHouseList;

    Game.houses.forEach((elem) => {$(`#${elem}`).addClass("house")});
    console.log(Game.houses);
}


 async function Simulate(){
    
    while (Game.houses.length > 0){
        const len = Game.houses.length;

        // if there are no houses
        if(len == 0){ 
            console.log("error");
            return;
        };

        let y_vals = Game.houses.map(function(elem){
            let y_val = elem.split("-")[0];
            // console.log(y_val);
            return parseInt(y_val, 10);
        })

        let x_vals = Game.houses.map(function(elem){
            let x_val = elem.split("-")[1];
            // console.log(x_val);
            return parseInt(x_val, 10);
        })

        let highest_y = Number.NEGATIVE_INFINITY;
        let lowest_y = Number.POSITIVE_INFINITY;

        y_vals.forEach(num => {if (num < lowest_y) lowest_y=num;})
        y_vals.forEach(num => {if (num > highest_y) highest_y=num;})

        let highest_x = Number.NEGATIVE_INFINITY;
        let lowest_x = Number.POSITIVE_INFINITY;

        x_vals.forEach(num => {if (num < lowest_x) lowest_x=num;})
        x_vals.forEach(num => {if (num > highest_x) highest_x=num;})

        highest_x++;
        highest_y++;
        lowest_x--;
        lowest_y--;

        let placesToCheck = [];

        for (let y = highest_y; y >= lowest_y; y--){
            for (let x = lowest_x; x <= highest_x; x++){
                placesToCheck.push(`${y}-${x}`);
            }
        }

        // console.log(`Highest : ${highest_y}`);
        // console.log(`Lowest : ${lowest_y}`);


        // console.log(y_vals);
        // console.log(x_vals);

        checkNeighbours(placesToCheck);

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log("Houses: "+ Game.houses);
    }
}