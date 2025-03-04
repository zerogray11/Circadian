from fastapi import FastAPI
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate("/Users/macbookpro/Desktop/CercadianApp/backend/circadianapp01-firebase-admin.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()

@app.get('/')
def home():
    return {'message': 'Circadian App Backend Running!'}

@app.post('/add-user')
def add_user(data: dict):
    uid = data['uid']
    db.collection('users').document(uid).set(data) 
    return {'message': 'User Added'}