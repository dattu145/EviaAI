const dicresponse = await fetch("../assets/js/dic.json");
const dictionary = await dicresponse.json();

async function fetchModelResponse(apiUrl, body) {
    const answerContainer = document.getElementById("answerContainer");
    answerContainer.innerText = "Loading...";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer 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`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.status === 503) {
            throw new Error("The model is currently loading or unavailable. Please try again shortly.");
        } else if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (!response.ok) {
            throw new Error("Failed to fetch answer. Please try again later.");
        }

        const data = await response.json();

        if (data && data.answer) {
            answerContainer.innerText = data.answer;
        } else if (data.summary) {
            answerContainer.innerText = data.summary;
        } else {
            answerContainer.innerText = "Sorry, no answer found.";
        }
    } catch (error) {
        answerContainer.innerText = error.message;
    }
}

const aibbtn = document.querySelector(".aibtn");
aibbtn.addEventListener("click",askQuestion);

async function askQuestion() {
    const question = document.getElementById("questionInput").value;
    const storyText = document.getElementById("story").innerText;
  
    if (!question.trim()) {
        document.getElementById("answerContainer").innerText = "Please enter a question.";
        return;
    }

    const body = {
        inputs: {
            question: question,
            context: storyText,
        }
    };
    
    fetchModelResponse("https://api-inference.huggingface.co/models/distilbert-base-uncased-distilled-squad", body);
}

async function generateSummary() {
    const storyText = document.getElementById("story").innerText;

    const body = {
        inputs: {
            question: "generate story biggly",
            context: storyText,
        }
    };
    
    fetchModelResponse("https://api-inference.huggingface.co/models/distilbert-base-uncased-distilled-squad", body);
}

async function generateMoral() {
    const storyText = document.getElementById("story").innerText;

    const body = {
        inputs: {
            question: "What is the moral of the story?",
            context: storyText,
        }
    };

    fetchModelResponse("https://api-inference.huggingface.co/models/distilbert-base-uncased-distilled-squad", body);
}


document.querySelector(".queus:nth-child(1)").addEventListener("click", generateSummary);
document.querySelector(".queus:nth-child(2)").addEventListener("click", generateMoral);


function close_windows(window, btn){
    const con = document.querySelector(window);
    document.querySelector(btn).addEventListener("click", () => {
        con.classList.remove("window_open");
    });
}

function open_windows(window, btn){
    const con = document.querySelector(window);
    const btns = document.querySelectorAll(btn);
    btns.forEach(element => {
        element.addEventListener("click", () => {
            con.classList.toggle("window_open");
            const state = con.classList.contains("window_open") ? 'open' : 'closed';
        });
    });
}


const books = document.querySelectorAll(".book"),
      story = document.querySelector(".container__details .story p"),
      title = document.querySelector(".container__details .title"),
      author = document.querySelector(".container__details span"),
      cover = document.querySelector(".main_container img");

      books.forEach(book => {
        const bookStory = book.querySelector(".inside_book .story"),
              bookTitle = book.querySelector(".details .title"),
              bookAuthor = book.querySelector(".inside_book .author"),
              bookCover = book.querySelector("img");
    
                if (bookStory) {
                    book.addEventListener("click", () => {
                    
                    const storyContent = bookStory.innerHTML
                    .split("<br><br>")
                    .map(paragraph =>
                    paragraph.split(' ')
                    .map(word => {
                        const cleanedWord = word.replace(/[\.,]/g, "");
 
                        if (dictionary[cleanedWord]) {
                            return `<span class="word dictionary-word">${word}</span>`;
                        } else {
                            return `<span class="word">${word}</span>`;
                        }
                    })
                    .join(' ')
                    )
                    .join('<br><br>');
            
                story.innerHTML = storyContent;
                title.innerHTML = bookTitle.innerHTML;
                author.innerHTML = bookAuthor.innerHTML;
                cover.src = bookCover.src;

                story.addEventListener('mouseover', (event) => {
                    if (event.target.classList.contains('dictionary-word')) {
                        const word = event.target.textContent.replace(/[\.,]/g, "");
                        const definition = dictionary[word].definition;
                
                        if (definition) {
                            tooltip.textContent = definition;
                            tooltip.classList.add('tooltip__show');
                        }
                    }
                });

                story.addEventListener('click', (event) => {
                    if (event.target.classList.contains('dictionary-word')) {
                        const wrd = event.target.textContent.replace(/[\.,]/g, "");
                        const translate__wrapper = document.querySelector(".translate__wrapper"),
                        word_chosen = document.querySelector(".word_chosen"),
                        word_translated = document.querySelector(".word_translated"),
                        translate_output = document.querySelector(".translate_output .output");

                        const select_input = document.querySelector("select");
                        word_chosen.innerHTML = wrd;

                        word_translated.innerHTML = dictionary[wrd].translations["word"]["tamil"];

                        translate_output.innerHTML = dictionary[wrd].translations["definition"]["tamil"];
                        select_input.value = "tamil";
                        select_input.addEventListener("change",()=>{
                            const lang = select_input.value;
                            word_translated.innerHTML = dictionary[wrd].translations["word"][lang];

                            translate_output.innerHTML = dictionary[wrd].translations["definition"][lang];
                        })

                        translate__wrapper.classList.add("translate__wrapper__active");
                        const definition = dictionary[wrd].definition;
                
                        if (definition) {
                            tooltip.textContent = definition;
                            tooltip.classList.add('tooltip__show');
                        }
                    }
                });

                story.addEventListener('mouseout', () => {
                    tooltip.classList.remove('tooltip__show');
                });                

        });
    }
});

const wrapper__btn = document.querySelector(".wrapper__btn"),
    wrapper=document.querySelector(".wrapper");

wrapper__btn.addEventListener("click",()=>{
    wrapper.style.display="none";
})

document.querySelector(".translate__wrapper .close__btn").addEventListener("click",()=>{
    const translate__wrapper = document.querySelector(".translate__wrapper"),
    select_input = document.querySelector("select");

    translate__wrapper.classList.remove("translate__wrapper__active");
    select_input.value = "tamil";
})


open_windows(".new__book", ".add_book_btn")
open_windows(".main_container",".book")
close_windows(".main_container", ".main_container .close__btn");
close_windows(".new__book",".close__btn")