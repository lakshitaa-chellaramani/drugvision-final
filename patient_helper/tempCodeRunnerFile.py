import fitz
from flask import Flask, request, jsonify
import google.generativeai as genai
import io
import base64
import os
from PIL import Image
from flask_cors import CORS
# from dotenv import load_dotenv
import re
import pytesseract
from fuzzywuzzy import fuzz
import cv2
import fitz
import ollama