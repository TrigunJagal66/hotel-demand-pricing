.PHONY: install train run test clean

install:
	pip install -r requirements.txt

train:
	python src/models/train_model.py

run:
	uvicorn app:app --reload

test:
	python src/models/predict.py

clean:
	rm -rf data/processed/
	rm -rf models_saved/
	find . -type d -name "__pycache__" -exec rm -rf {} +
