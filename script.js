'use strict';


class Walk{
    //make date of walk
    date = new Date()
    id = (new Date()+'').slice(-10)

    constructor(coords,distance,duration){
    this.coords =coords
    this.distance = distance//km
    this.duration = duration // in min
    
    
  } 

  _setDescription(){
     // prettier-ignore
     const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'];
      this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on 
      ${ months[this.date.getMonth()]} ${this.date.getDate()}`
  }
  click(){
    this.click++
  }
}



class Walking extends Walk{
    type = 'walking'
    constructor(coords,distance,duration,cedence){
        super(coords,distance,duration)
        this.cedence = cedence
        this.calcPace()
        this._setDescription()  
    }

    calcPace(){
        //min/km
        this.pace = this.duration/this.distance
        return this.pace
    }

}

class Running extends Walk{
    type = 'running'
    constructor(coords,distance,duration,cedence){
        super(coords,distance,duration)
        this.cedence = cedence
        this.calcPace()
        this._setDescription()  
    }

    calcPace(){
        //min/km
        this.pace = this.duration/this.distance
        return this.pace
    }

}
class Cycling extends Walk{
    type = 'cycling'
    constructor(coords,distance,duration,elevation){
        super(coords,distance,duration)
        this.elevation = elevation
        this.calcSpeed()
        this._setDescription()  

   }

   calcSpeed(){
       //km/h
       this.speed = this.distance/(this.duration/60)
       return this.speed
   }
}






//--------------------------------------------------


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const remove = document.getElementById('remove')
//the main class
class App{
    

    //private objects
    #map
    #mapEvent
    #workout=[]  
    #mapZoomLvl = 17

    constructor(){
      
      //Get users posstion
      this._getPosition()
      //Get data from local storage
      this._getLocalStorage()


      //Atach event handlers
      form.addEventListener('submit',this._newWalk.bind(this))
      inputType.addEventListener('change',this._toggleEleavtionField)
      containerWorkouts.addEventListener('click',this._moveToPopup.bind(this))

      //Remove all the local storage
      remove.addEventListener('click',this.reset.bind(this))
    }

    _getPosition(){
       if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
             alert('Could not get your position')
            })
            
        }

          _loadMap(position){
            
            const {latitude} = position.coords
            const{longitude} = position.coords
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
            const coords = [latitude,longitude]
        
            
         this.#map = L.map('map').setView([latitude, longitude],this.#mapZoomLvl);
          //mark your location 
          L.marker([latitude, longitude])
          .addTo(this.#map)
          .bindPopup('your location')
          .openPopup();
        
         //Style of map
         L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
        
          //Handling clicks on map
          this.#map.on('click',this._showForm.bind(this))

          this.#workout.forEach(work =>{
          this.renderWorkoutMarker(work)
          
              })
              }
    
        _showForm(mapE){
          this.#mapEvent = mapE
          form.classList.remove('hidden')
          inputDistance.focus()
    }

      _hideForm(){
        inputDistance.value = inputDuration.value =inputCadence.value =inputElevation.value =""

        form.style.display = 'none'
        form.classList.add('hidden')
        setTimeout(()=>form.style.display = 'grid',1000)
    }

    _toggleEleavtionField(){

        inputElevation.closest('.form__row')
        .classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row')
        .classList.toggle('form__row--hidden')
    }

    _newWalk(e){


        //valid the inputs 
        const validInputs = (...inputs) =>
        inputs.every(inp=>Number.isFinite(inp))

        const allPositive = (...inputs) =>inputs.every(inp=> inp>0)


         e.preventDefault()
         //Get data from form
         const type = inputType.value
         const distance =+inputDistance.value
         const duration=+ inputDuration.value
         const{lat,lng} = this.#mapEvent.latlng 
         let workout 
         //If workout running,create running object
          if(type === 'running'){
              const cadence= +inputCadence.value
              //Cheak if data is valid 
              if(!validInputs(distance,duration,cadence)||
              !allPositive(distance,cadence,duration))
           return alert('inputs have to be positive numbers')

           workout =  new Running([lat,lng],distance,duration,cadence)

          }
         //If workout walking,create walking object
         if(type === 'walking'){
            const cadence =+inputCadence.value
                //Cheak if data is valid 
                if(!validInputs(distance,duration,cadence)||
              !allPositive(distance,duration))
           return alert('inputs have to be positive numbers')
          

           workout =  new Walking([lat,lng],distance,duration,cadence)

         }

         //if workout cyciling ,create cycling object
         if(type === 'cycling'){
            const elevation =+inputElevation.value

              //Cheak if data is valid 
           if(!validInputs(distance,duration,elevation)||
           !allPositive(distance,duration,))
           return alert('inputs have to be positive numbers')

           workout =  new Cycling([lat,lng],distance,duration,elevation)

         }

         //Add new object array of workout
          
         this.#workout.push(workout);
         console.log(workout)

         //Render workout on map as marker
          this.renderWorkoutMarker(workout)

          //Render workout on list
           this._renderWorkout(workout)

           //Clear input fields
          this._hideForm(workout)

          //Set local storage to all workouts
          this._setLocalStorage()

          


            }

            renderWorkoutMarker(workout){
          //mark your trip distance
          console.log(this.#mapEvent)  
          L.marker(workout.coords)
          .addTo(this.#map)
          .bindPopup(L.popup({
           maxWidth: 250,
           minWidth:100,
           autoClose:false,
           closeOnClick:false,
           className: `${workout.type}-popup`,
            }))
          .setPopupContent(`${workout.type}-popup`)
          .openPopup(); 

            }


            _renderWorkout(workout){

                let html = `
                <li class="workout workout--${workout.type}" data-id="${workout.id}">
              <h2 class="workout__title">${workout.description}</h2>
              <div class="workout__details">
               <span class="workout__icon">${workout.type === 'running'|| 'walking'? '🏃‍♂️':'🚴'}</span>
               <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
             </div>
              <div class="workout__details">
                 <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
             <span class="workout__unit">min</span>
             </div>
            
                `


                if(workout.type === 'running')

                html+= ` <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
               </div>
               <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cedence}</span>
                <span class="workout__unit">spm</span>
               </div>
              </li>`

              if(workout.type === 'walking') 

              html+= ` <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.pace.toFixed(1)}</span>
              <span class="workout__unit">min/km</span>
             </div>
             <div class="workout__details">
              <span class="workout__icon">🦶🏼</span>
              <span class="workout__value">${workout.cedence}</span>
              <span class="workout__unit">spm</span>
             </div>
              </li>`

               if(workout.type === 'cycling')

               html+= `  <div class="workout__details">
                 <span class="workout__icon">⚡️</span>
               <span class="workout__value">${workout.speed.toFixed(1)}</span>
               <span class="workout__unit">km/h</span>
               </div>
               <div class="workout__details">
                <span class="workout__icon">⛰</span>
               <span class="workout__value">${workout.elevation}</span>
                <span class="workout__unit">m</span>
              </div>
              </li> `

               form.insertAdjacentHTML('afterend',html)
            }
            _moveToPopup(e){
              const workoutEl= e.target.closest('.workout')

              if(!workoutEl) return;

              const workout = this.#workout.find(work =>work.id === workoutEl.dataset.id)

              this.#map.setView(workout.coords,this.#mapZoomLvl,{
                animate:true,
                pan:{
                  duration:1
                }
              })

              //using the public interface
            //workout.click()
            }

            _setLocalStorage(){
              localStorage.setItem('workouts',JSON.stringify(this.#workout))
            }
            _getLocalStorage(){
            const data = JSON.parse(localStorage.getItem('workouts'))

            if(!data) return;
            
            this.#workout = data
            this.#workout.forEach(work =>{
              this._renderWorkout(work)
              
            })
            }

            reset(){
              localStorage.removeItem('workouts')
              location.reload()
            }    
        }
        
//the app
const app =new App()
