FROM python:3.11.4-alpine3.18

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

CMD [ "python", "main.py" ]