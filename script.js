let allFilters=document.querySelectorAll(".filter");
let openModal=document.querySelector(".open-modal");
let closeModal=document.querySelector(".close-modal");
let ticketsContainer=document.querySelector(".ticket-container");
let myDB = window.localStorage;

let ticketModalOpen=false;
let isTextTyped=false;

let allFilterClasses=["red","blue","green","yellow","black"];

openModal.addEventListener("click",openTicketModal);
closeModal.addEventListener("click",closeTicketModal);

for(let i=0;i<allFilters.length;i++){
    allFilters[i].addEventListener("click",selectFilter);
}

function selectFilter(e){
    if(e.target.classList.contains("active-filter")){
        e.target.classList.remove("active-filter");
        ticketsContainer.innerHTML="";
        loadTickets();
    }else{
        if(document.querySelector(".active-filter")){
            document.querySelector(".active-filter").classList.remove("active-filter");
        }
        e.target.classList.add("active-filter");
        ticketsContainer.innerHTML="";
        let filterClicked=e.target.classList[1];
        loadSelectedTickets(filterClicked);
    }
}

function loadSelectedTickets(filter){
    let allTickets=JSON.parse(myDB.getItem("allTickets"));
    let selectedFilterTickets=allTickets.filter(function(ticket){
        if(ticket.ticketFilter==filter){
            return true;
        }
        return false;
    });
    for(let i=0;i<selectedFilterTickets.length;i++){
        appendTicket(selectedFilterTickets[i]);
    }
}



function loadTickets(){
    let allTickets = myDB.getItem("allTickets");
    if (allTickets && allTickets.length) {
        allTickets = JSON.parse(allTickets);
        for(let i=0;i<allTickets.length;i++){
            appendTicket(allTickets[i]);
        }
    }
}
loadTickets();


function closeTicketModal(e) {
    if(ticketModalOpen){
        document.querySelector(".ticket-modal").remove();
        ticketModalOpen=false;  
    }
}

function openTicketModal(e) {
    if(ticketModalOpen)
        return;
    let  ticketModal=document.createElement("div");
    ticketModal.classList.add("ticket-modal");

    ticketModal.innerHTML = `
        <div class="ticket-text" contenteditable="true">
            ${`Enter your Text!`}
        </div>
        <div class="ticket-filters">
            <div class="ticket-filters2 red selected-filter"></div>
            <div class="ticket-filters2 blue"></div>
            <div class="ticket-filters2 green"></div>
            <div class="ticket-filters2 yellow"></div>
            <div class="ticket-filters2  black"></div>
        </div>
    `;
    document.querySelector("body").append(ticketModal);

    ticketModalOpen=true;
    isTextTyped=true;

    let ticketTextDiv=document.querySelector(".ticket-text");

    ticketTextDiv.addEventListener("keypress",handleKeyPress);    
    let ticketFilters=ticketModal.querySelectorAll(".ticket-filters2");

    for(let i=0;i<ticketFilters.length;i++){
        ticketFilters[i].addEventListener("click",function(e){
            if(e.target.classList.contains("selected-filter"))
                return;
            document.querySelector(".selected-filter").
            classList.remove("selected-filter");
            e.target.classList.add("selected-filter");
        });
    }
}

function handleKeyPress(e,ticketId){
    if(e.key == "Enter" && isTextTyped && e.target.textContent){
        let filterSelected=document.querySelector(".selected-filter").classList[1];
        if(!ticketId)
            ticketId=uuid();

        let ticketInfoObject={
            ticketFilter : filterSelected,
            ticketValue :   e.target.textContent,
            ticketId : ticketId
        };
        appendTicket(ticketInfoObject);
        closeModal.click();
        saveTicketToDb(ticketInfoObject);
    }
    if (!isTextTyped) {
        isTextTyped = true;
        e.target.textContent = "";
    }
}

function saveTicketToDb(ticketInfoObject){
    let allTickets = myDB.getItem("allTickets");
    if ( allTickets &&   allTickets.length) {
      allTickets = JSON.parse(allTickets);
      allTickets.push(ticketInfoObject);
      myDB.setItem("allTickets", JSON.stringify(allTickets));
    } else {
      let allTickets = [ticketInfoObject];
      myDB.setItem("allTickets", JSON.stringify(allTickets));
    }   
}


function appendTicket(ticketInfoObject){
    let {ticketFilter,ticketValue,ticketId}= ticketInfoObject;

    let ticketText=document.createElement("div");   
    ticketText.classList.add("ticket");

    ticketText.innerHTML=`
        <div class="ticket-header ${ticketFilter}">
        </div>
        
        <div class="ticket-content">
            <div class="ticket-info">
                <div class="ticket-id">    
                    ${ticketId}
                </div>
                <div class="ticket-options">
                    <div class="ticket-delete">
                        <i class="fa-solid fa-trash"></i>
                    </div>
                    <div class="ticket-edit">
                        <i class="fa-solid fa-pen"></i>
                    </div>
                </div>
            </div>
            <div class="ticket-value">
                ${ticketValue}
            </div>
        </div>  
    `;

    let ticketHeader=ticketText.querySelector(".ticket-header");

    ticketHeader.addEventListener("click",function(e){
        let currentFilter=e.target.classList[1];
        let indexOfCurrentFilter=allFilterClasses.indexOf(currentFilter);
        
        let newIndex=(indexOfCurrentFilter+1)%allFilterClasses.length;
        let newFilter=allFilterClasses[newIndex];

        ticketHeader.classList.remove(currentFilter);
        ticketHeader.classList.add(newFilter);

        let allTickets=JSON.parse(myDB.getItem("allTickets"));

        for(let i=0;i<allTickets.length;i++){
            if(allTickets[i].ticketId==ticketId){
                allTickets[i].ticketFilter=newFilter;
            }
        }

        myDB.setItem("allTickets",JSON.stringify(allTickets));
    });

    let deleteTicketBtn = ticketText.querySelector(".ticket-delete");

    deleteTicketBtn.addEventListener("click",function(e){
        ticketText.remove();
        let allTickets= JSON.parse(myDB.getItem("allTickets"));

        let updatedTickets= allTickets.filter(function(ticketObject){
            if(ticketObject.ticketId == ticketId){
                return false;
            }
            return true;
        });
        myDB.setItem("allTickets",JSON.stringify(updatedTickets));
    });
    ticketsContainer.append(ticketText);



    
    let editTicketBtn = ticketText.querySelector(".ticket-edit");
    editTicketBtn.addEventListener("click",function(e){
        
        function openModal(e){
            if(ticketModalOpen)
                return; 
            
            let  ticketModal=document.createElement("div");
            ticketModal.classList.add("ticket-modal");
        
            ticketModal.innerHTML = `
                <div class="ticket-text" contenteditable="true">
                    ${ticketValue}
                </div>
                <div class="ticket-filters">
                    <div class="ticket-filters2 red selected-filter"></div>
                    <div class="ticket-filters2 blue"></div>
                    <div class="ticket-filters2 green"></div>
                    <div class="ticket-filters2 yellow"></div>
                    <div class="ticket-filters2  black"></div>
                </div>
            `;

            document.querySelector("body").append(ticketModal);
            ticketModalOpen=true;
            isTextTyped=true;
            
            let ticketTextDiv=document.querySelector(".ticket-text");
            ticketTextDiv.addEventListener("keypress",handleKeyPress);

            let ticketFilters=ticketModal.querySelectorAll(".ticket-filters2");

            for(let i=0;i<ticketFilters.length;i++){
                ticketFilters[i].addEventListener("click",function(e){
                    if(e.target.classList.contains("selected-filter"))
                        return;
                    document.querySelector(".selected-filter").
                    classList.remove("selected-filter");
                    e.target.classList.add("selected-filter");
                });
            }
        }
        openModal();
       
        function handleKeyPress(e){
            if(e.key == "Enter" && isTextTyped && e.target.textContent){
                let filterSelected=document.querySelector(".selected-filter").classList[1];
                
                ticketId=ticketId;
                let ticketInfoObject={
                    ticketFilter : filterSelected,
                    ticketValue :   e.target.textContent,
                    ticketId : ticketId
                };

                ticketText.remove();
                let allTickets= JSON.parse(myDB.getItem("allTickets"));

                let updatedTickets= allTickets.filter(function(ticketObject){
                    if(ticketObject.ticketId == ticketId){
                        return false;
                    }
                    return true;
                });
                myDB.setItem("allTickets",JSON.stringify(updatedTickets));    
                
                appendTicket(ticketInfoObject);
                closeModal.click();
                saveTicketToDb(ticketInfoObject);
                    
            }
            if (!isTextTyped) {
                isTextTyped = true;
                e.target.textContent = "";
            }
        }
    });

}

