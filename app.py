from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from transformers import BertTokenizer, BertModel
from nltk.corpus import wordnet
import spacy
import nltk
from nltk.corpus import brown
from nltk import FreqDist
import torch


nltk.download('brown')
nltk.download('wordnet')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

spacy.cli.download("en_core_web_sm")

brown_words = brown.words()
freq_dist = FreqDist(brown_words)

FREQUENCY_THRESHOLD = 1000


nlp = spacy.load("en_core_web_sm")
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertModel.from_pretrained("bert-base-uncased")


app = Flask(__name__, template_folder='templates')  # Use the 'templates' folder for HTML files
CORS(app)

def is_difficult(word):
    word_embedding = get_word_embedding(word)
    reference_embedding = get_word_embedding("cat")
    similarity_score = torch.cosine_similarity(word_embedding, reference_embedding, dim=1)
    return similarity_score

def get_word_embedding(word):
    inputs = tokenizer(word, return_tensors="pt")
    outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).detach()

def get_difficult_words(text):
    doc = nlp(text)
    difficult_words = {}
    for token in doc:
        if token.is_alpha and not token.is_stop:
            if is_difficult(token.text):
                difficult_words[token.text] = None
    return difficult_words

def get_word_definition(word):
    synsets = wordnet.synsets(word)
    if synsets:
        return synsets[0].definition()
    return "No definition found."

def get_contextual_difficult_words(text):
    doc = nlp(text)
    difficult_words = {}
    for token in doc:
        if token.is_alpha and not token.is_stop:
            word_embedding = get_word_embedding(token.text)
            if is_difficult(token.text):
                difficult_words[token.text] = get_word_definition(token.text)
    return difficult_words

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/get_difficult_words_route', methods=['POST'])
def get_difficult_words_route():
    data = request.json
    text = data.get("text")
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    result = get_contextual_difficult_words(text)
    return result


if __name__ == '__main__':
    app.run(debug=True)