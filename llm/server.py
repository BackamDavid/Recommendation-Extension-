# llm/server.py
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = FastAPI(title="Local LLM Server")

# Define request model
class QueryRequest(BaseModel):
    prompt: str

# Load your model with acceleration
MODEL_PATH = "./friend"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")
print(f"🚀 Using device: {device}")
model = AutoModelForCausalLM.from_pretrained(MODEL_PATH).to(device)

@app.post("/query")
def query_llm(request: QueryRequest):
    input_ids = tokenizer(request.prompt, return_tensors="pt").input_ids.to(device)
    
    # Optimized generation parameters for speed
    output_ids = model.generate(
        input_ids,
        max_new_tokens=50,  # Only generate 50 new tokens (faster than max_length=200)
        temperature=0.7,
        do_sample=True,
        top_p=0.9,
        pad_token_id=tokenizer.eos_token_id
    )
    
    output_text = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return {"text": output_text}

@app.get("/")
def root():
    return {"message": "LLM Server is running"}
