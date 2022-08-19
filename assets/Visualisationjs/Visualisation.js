class Visualisation{
    constructor(visSpeed=20, houseChoice="house-red"){
        this.houses = [];
        this.isSimulating = false;
        this.loadTemplate = this.loadTemplate.bind(this);
        this.visSpeed = visSpeed; // visSpeed is 20 by default
        this.houseChoice = houseChoice; // houseChoice is red by default
    }
    Simulate = () => {
        this.isSimulating = true;
        // disable start button
        $("#start-vis-btn").attr("disabled", true);
        // enable stop button
        $("#stop-vis-btn").attr("disabled", false);

        while (this.houses.length > 0 && this.isSimulating){
            const len = this.houses.length;

            // if there are no houses
            if(len == 0){ 
                console.log("error");
                return;
            };

            let y_vals = this.houses.map(function(elem){
                let y_val = elem.split("-")[0];
                // console.log(y_val);
                return parseInt(y_val, 10);
            })

            let x_vals = this.houses.map(function(elem){
                let x_val = elem.split("-")[1];
                // console.log(x_val);
                return parseInt(x_val, 10);
            })

            let highest_y = Number.NEGATIVE_INFINITY;
            let lowest_y = Number.POSITIVE_INFINITY;

            y_vals.forEach(num => {if (num < lowest_y) lowest_y=num;});
            y_vals.forEach(num => {if (num > highest_y) highest_y=num;});

            let highest_x = Number.NEGATIVE_INFINITY;
            let lowest_x = Number.POSITIVE_INFINITY;

            x_vals.forEach(num => {if (num < lowest_x) lowest_x=num;});
            x_vals.forEach(num => {if (num > highest_x) highest_x=num;});

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

            this.checkNeighbours(placesToCheck);

            await new Promise(resolve => setTimeout(resolve, 10000/this.visSpeed));

            console.log("Houses: "+ this.houses);
        }
    }

    async checkNeighbours(placesToCheck){
        let len = placesToCheck.length;

        let newHouseList = [];
    
        for (let i = 0; i < len; i++){
            // this.updateJSON();
    
            let neighbours = 0;
            const y = placesToCheck[i].split("-")[0];
            const x = placesToCheck[i].split("-")[1];
    
            // checks each adjascent block for the prescence of a house
            this.houses.includes(`${parseInt(y, 10)+1}-${parseInt(x, 10)}`) ? neighbours++ : null; // up
            this.houses.includes(`${parseInt(y, 10)+1}-${parseInt(x, 10)+1}`) ? neighbours++ : null; // north-east
            this.houses.includes(`${parseInt(y, 10)}-${parseInt(x, 10)+1}`) ? neighbours++ : null; // right
            this.houses.includes(`${parseInt(y, 10)-1}-${parseInt(x, 10)+1}`) ? neighbours++ : null; // south-east
            this.houses.includes(`${parseInt(y, 10)-1}-${parseInt(x, 10)}`) ? neighbours++ : null; // bottom
            this.houses.includes(`${parseInt(y, 10)-1}-${parseInt(x, 10)-1}`) ? neighbours++ : null; // south-west
            this.houses.includes(`${parseInt(y, 10)}-${parseInt(x, 10)-1}`) ? neighbours++ : null; // left
            this.houses.includes(`${parseInt(y, 10)+1}-${parseInt(x, 10)-1}`) ? neighbours++ : null; // north-west
    
            // console.log(neighbours);
            console.log(neighbours);
    
            let id = `${y}-${x}`;
    
            if($(`#${id}`).hasClass(this.houseChoice)){
                 if(neighbours == 3 || neighbours == 2) newHouseList.push(id);
             } else {
                if(neighbours == 3) newHouseList.push(id);
             }  
        }
    
        this.houses.forEach((elem) => {$(`#${elem}`).removeClass(this.houseChoice)});
        this.houses = newHouseList;
        this.houses.forEach((elem) => {$(`#${elem}`).addClass(this.houseChoice)});
        console.log(this.houses);

    }

    stopSimulation(){
        this.isSimulating = false;
        // enable start button
        $("#start-vis-btn").attr("disabled", false);
        // disable stop button
        $("#stop-vis-btn").attr("disabled", true);
    }

    clearHouseColours() {
        this.houses.forEach((elem) => {
            $(`#${elem}`).removeClass();
            $(`#${elem}`).addClass(this.houseChoice);
        })
    }

    clearHouses(){
        this.houses.forEach(function(block_id){
            $(`#${block_id}`).removeClass();
        })
        // $("td").each(function(){ $(this).removeClass();});
        this.houses = [];
        this.stopSimulation();
    }

    exportJSON(){
        var fileToSave = new Blob(
            [JSON.stringify({ housePositions: this.houses})],{
                type: "application/json",
                name: "housePosition.json"
            })
    
        saveAs(fileToSave, "housePosition.json")
    }

    async importJSON(files){
        const file = files.item(0);
        if (file.type == "application/json"){
            let fileText = await file.text();
            // console.log(fileText);
            fileObj = JSON.parse(fileText);
            // console.log(fileObj.housePositions);
            fileObj.housePositions.forEach(function(house){
                $(`#${house}`).click();
            })
        } else {
            alert("\nYou chose an invalid file type.\nPlease upload a json file.")
        }
    }

    loadTemplate(event){
        this.clearHouseColours();
        let housePositions = [];
        switch(event.target.id){
            case "glider-gun":
                housePositions = ["69-6","68-6","68-7","69-7","69-16","68-16","67-16","70-17","71-18","71-19","66-17","65-18","65-19","68-20","70-21","69-22","68-22","67-22","66-21","68-23","69-26","69-27","70-27","70-26","71-26","71-27","72-28","68-28","72-30","73-30","68-30","67-30","71-40","71-41","70-41","70-40"];
                break;
            case "bi-gun":
                housePositions = ["59-7","58-7","59-8","58-8","59-16","59-17","60-17","58-17","58-18","60-18","57-18","60-21","64-21","64-17","66-17","64-18","65-17","65-16","66-18","67-18","64-22","60-22","60-41","60-42","60-45","60-46","61-46","62-46","61-47","63-45","62-45","56-41","56-42","56-45","56-46","55-46","54-46","54-45","55-47","53-45","61-55","62-55","62-56","61-56"];
                break;
            case "ak-94":
                housePositions = ["73-14","72-14","72-15","72-16","71-17","70-17","70-16","72-22","73-22","72-23","72-24","71-25","70-25","70-24","72-30","73-30","73-31","72-31","65-14","65-13","65-12","66-12","64-15","63-15","63-14","59-13","59-12","58-12","58-13","54-14","53-14","53-13","54-12","55-11","55-10","56-10","57-10","58-10","59-10","59-9","57-8","57-7","58-7","54-9","54-8","53-10","52-9","52-8","53-7","69-37","68-37","69-38","68-39","67-40","67-41","66-41","65-41","64-41","63-41","64-39","63-39","63-38","64-38","63-42","65-43","65-44","64-44","68-42","68-43","69-41","70-42","70-43","69-44","59-37","59-36","58-36","57-37","57-38","57-39","56-39","60-24","59-25","59-23","58-26","57-26","56-26","58-22","57-22","56-22","55-23","55-25","54-24","52-26","52-27","51-26","50-27","50-28","50-29","49-29","50-21","50-20","49-20","49-21"];
                break;
            case "simkin-glider-gun":
                housePositions = ["71-6","70-6","70-7","71-7","68-10","68-11","67-11","67-10","70-13","71-13","71-14","70-14","62-28","61-27","60-27","59-27","59-28","59-29","62-29","62-31","62-32","61-33","60-34","59-33","58-32","60-37","60-38","59-38","59-37","54-27","54-26","53-26","52-27","52-28","52-29","51-29"];
                break;
            case "pipe-dreams":
                housePositions = ["73-15","73-16","73-21","73-22","73-25","73-26","73-31","73-32","73-35","73-36","73-41","73-42","73-45","73-46","73-51","73-52","73-55","73-56","73-61","73-62","73-65","73-66","73-71","73-72","72-15","72-17","72-20","72-22","72-25","72-27","72-30","72-32","72-35","72-37","72-40","72-42","72-45","72-47","72-50","72-52","72-55","72-57","72-60","72-62","72-65","72-67","72-70","72-72","71-17","71-18","71-19","71-20","71-27","71-30","71-37","71-38","71-39","71-40","71-47","71-50","71-57","71-58","71-59","71-60","71-67","71-70","70-15","70-17","70-20","70-22","70-25","70-27","70-30","70-32","70-35","70-37","70-40","70-42","70-45","70-47","70-50","70-52","70-55","70-57","70-60","70-62","70-65","70-67","70-70","70-72","69-15","69-16","69-21","69-22","69-25","69-26","69-31","69-32","69-35","69-36","69-41","69-42","69-45","69-46","69-51","69-52","69-55","69-56","69-61","69-62","69-65","69-66","69-71","69-72","66-15","66-16","66-21","66-22","66-25","66-26","66-31","66-32","66-35","66-36","66-41","66-42","66-45","66-46","66-51","66-52","66-55","66-56","66-61","66-62","66-65","66-66","66-71","66-72","65-15","65-17","65-20","65-22","65-25","65-27","65-30","65-32","65-35","65-37","65-40","65-42","65-45","65-47","65-50","65-52","65-55","65-57","65-60","65-62","65-65","65-67","65-70","65-72","64-17","64-18","64-19","64-20","64-27","64-30","64-37","64-38","64-39","64-40","64-47","64-50","64-57","64-58","64-59","64-60","64-67","64-70","63-15","63-17","63-20","63-22","63-25","63-27","63-30","63-32","63-35","63-37","63-40","63-42","63-45","63-47","63-50","63-52","63-55","63-57","63-60","63-62","63-65","63-67","63-70","63-72","62-15","62-16","62-21","62-22","62-25","62-26","62-31","62-32","62-35","62-36","62-41","62-42","62-45","62-46","62-51","62-52","62-55","62-56","62-61","62-62","62-65","62-66","62-71","62-72"];
                break;
        }
        housePositions.forEach(function(house){
            $(`#${house}`).click();
        })
    }

    addHouse(id){ this.houses.push(id) };
    removeHouse(id){ this.houses.splice(this.houses.indexOf(id), 1) };
}


