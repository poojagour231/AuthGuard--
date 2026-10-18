# 🛡️ AuthGuard – Website Security & Phishing Detection

**AuthGuard** is a website security and phishing detection project designed to help users identify potentially malicious or suspicious URLs before interacting with them. It analyzes URL patterns using Machine Learning and provides security insights to help users make safer browsing decisions.

## 🚀 Overview

Phishing websites often imitate legitimate websites to steal sensitive information, including login credentials and personal data. AuthGuard aims to identify potentially dangerous URLs by analyzing their characteristics and classifying them as suspicious or legitimate.

The project combines a web-based security dashboard, backend APIs, and a Machine Learning model to provide URL analysis and security reports through a simple interface.

## ✨ Key Features

* **Phishing URL Detection:** Analyzes URLs using a Machine Learning model.
* **Website Security Scanner:** Allows users to submit a URL for security analysis.
* **Risk Assessment:** Presents the detection result to help users understand potential website risks.
* **Security Reports:** Displays available scan results and technical information.
* **Scan History:** Keeps track of previous website scans when supported by the connected backend.
* **Interactive Dashboard:** Provides a clean interface for accessing security features.
* **URL Feature Extraction:** Examines URL characteristics to support phishing detection.
* **Responsive Interface:** Designed to provide a usable experience across different screen sizes.

## 🧠 How It Works

1. **Enter a URL:** The user submits a website URL for analysis.
2. **URL Validation:** The application checks whether the submitted URL has a valid format.
3. **Feature Extraction:** The ML component extracts relevant characteristics from the URL.
4. **Model Prediction:** The trained Machine Learning model analyzes the extracted features.
5. **Result Generation:** The application displays the model's prediction and available security details.
6. **Security Insights:** The user reviews the result before deciding whether to visit the website.

> **Important:** A URL classified as legitimate by the model is not guaranteed to be safe. AuthGuard is a security-assistance tool, not a replacement for comprehensive website security checks.

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* REST APIs

### Machine Learning

* Python
* Pandas
* Scikit-learn
* URL Feature Extraction
* Classification Model

*Note: The technologies listed above represent the project's intended stack. Individual components may require configuration or integration before all features work together.*

## 📂 Project Structure

```text
AuthGuard/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── config/
│   ├── package.json
│   └── .env.example
│
├── ml-model/
│   ├── train.py
│   ├── predict.py
│   ├── url_features.py
│   └── phishing_site_urls.csv
│
└── README.md
```

*The directory structure is illustrative. Adjust it to match the actual repository.*

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

* Node.js and npm
* Python 3.10 or a compatible version
* MongoDB, if required by the backend
* Git

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd AuthGuard
```

### 2. Set Up the Frontend

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal.

### 3. Set Up the Backend

Open another terminal:

```bash
cd backend
npm install
```

Create a `.env` file and configure the required environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

Start the backend:

```bash
npm run dev
```

The API base URL is expected to be:

```text
http://localhost:5000/api/v1
```

*Use these commands only if the corresponding scripts, routes, and configuration exist in your repository.*

### 4. Set Up the Machine Learning Model

Navigate to the directory containing the ML scripts:

```bash
cd ml-model
```

Install the required Python libraries:

```bash
pip install pandas scikit-learn joblib
```

Place the phishing URL dataset in the appropriate location. The training script must be configured to read the dataset's actual filename and column names.

Train the model:

```bash
python train.py
```

Generate predictions using the prediction script according to its implemented interface:

```bash
python predict.py
```

**Important:** The training and prediction scripts must use compatible feature extraction and model-loading logic. The dataset must contain the columns expected by the training code.

## 📊 Machine Learning Evaluation

The model can be evaluated using the following metrics:

* Accuracy
* Precision
* Recall
* F1-score
* Confusion Matrix

These metrics help evaluate the model's ability to distinguish phishing URLs from legitimate URLs.

Actual performance should be reported only after evaluating the trained model on an appropriate test dataset. High accuracy alone does not guarantee reliable detection of previously unseen phishing websites.

## 🔐 Security and Privacy

AuthGuard is designed to support safer browsing through URL analysis.

* Analyze submitted URLs for potential phishing indicators.
* Avoid collecting passwords, OTPs, or other sensitive credentials.
* Store scan history only when the corresponding functionality is implemented and enabled.
* Protect backend credentials and secrets using environment variables.
* Validate user input and secure API endpoints.
* Do not treat a successful model prediction as proof that a website is safe.

## 🎯 Project Objectives

* Detect potentially malicious URLs using Machine Learning.
* Help users recognize suspicious websites.
* Present technical security information in an understandable format.
* Integrate frontend, backend, and ML components into a unified application.
* Promote safer browsing habits through accessible security insights.

## 🔮 Future Enhancements

* Browser extension integration for real-time URL checking.
* Improved detection using additional URL and domain features.
* Integration with trusted threat-intelligence services.
* Enhanced security reports and scan history.
* Model evaluation against unseen phishing datasets.
* Improved detection of newly emerging phishing techniques.

## 👥 Project Team

**Project Name:** AuthGuard
**Domain:** Cybersecurity and Machine Learning
**Project Type:** Website Security and Phishing Detection

Developed as a project to explore Machine Learning applications in cybersecurity and improve awareness of potentially malicious websites.

## ⚠️ Disclaimer

AuthGuard is an assistive security project. Its predictions may contain false positives and false negatives. Users should independently verify suspicious websites and avoid entering sensitive information on untrusted pages.

---

**AuthGuard — Browse Smarter. Stay Safer.**
