import torch
import torchaudio
from datasets import load_dataset
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

# Use the latest version of the Common Voice dataset
test_dataset = load_dataset("mozilla-foundation/common_voice_11_0",
                            "uk", split="test[:2%]", trust_remote_code=True)

processor = Wav2Vec2Processor.from_pretrained(
    "anton-l/wav2vec2-large-xlsr-53-ukrainian")
model = Wav2Vec2ForCTC.from_pretrained(
    "anton-l/wav2vec2-large-xlsr-53-ukrainian")

resampler = torchaudio.transforms.Resample(48_000, 16_000)

# Preprocessing the datasets.


def speech_file_to_array_fn(batch):
    speech_array, sampling_rate = torchaudio.load(batch["path"])
    batch["speech"] = resampler(speech_array).squeeze().numpy()
    return batch


test_dataset = test_dataset.map(speech_file_to_array_fn)
inputs = processor(test_dataset["speech"][:2],
                   sampling_rate=16_000, return_tensors="pt", padding=True)

with torch.no_grad():
    logits = model(inputs.input_values,
                   attention_mask=inputs.attention_mask).logits

predicted_ids = torch.argmax(logits, dim=-1)

print("Prediction:", processor.batch_decode(predicted_ids))
print("Reference:", test_dataset["sentence"][:2])
