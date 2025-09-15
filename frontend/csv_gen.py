# Install required packages if not already installed
# pip install kaggle pandas

import os
import pandas as pd
from zipfile import ZipFile

# ---------- Step 1: Set up Kaggle ----------
# Make sure your kaggle.json is in ~/.kaggle/kaggle.json (Linux/Mac)
# or C:\Users\<username>\.kaggle\kaggle.json (Windows)

dataset = "sudhanvahg/indian-crimes-dataset"
download_path = "datasets"
os.makedirs(download_path, exist_ok=True)

# ---------- Step 2: Download and unzip the dataset ----------
os.system(f'kaggle datasets download -d {dataset} -p {download_path} --unzip')

print("Dataset downloaded and unzipped.")

# ---------- Step 3: Inspect the folder ----------
files = os.listdir(download_path)
print("Files available:", files)

# ---------- Step 4: Load CSV files into pandas ----------
# Assuming the dataset has multiple CSV files like 'states.csv', 'districts.csv', etc.
# We'll combine them if necessary. Modify filenames as per actual files.
dfs = []
for file in files:
    if file.endswith(".csv"):
        df = pd.read_csv(os.path.join(download_path, file))
        print(f"Loaded {file}, shape: {df.shape}")
        dfs.append(df)

# ---------- Step 5: Basic cleaning ----------
# We'll keep only important columns: Year, State, Crime type, Cases
# This is a simplified example; adjust column names based on actual CSV

# For demo, let's pick the first CSV
crime_df = dfs[0].copy()

# Standardize column names
crime_df.columns = [c.strip().lower().replace(" ", "_") for c in crime_df.columns]

# Keep essential columns (adjust according to your CSV structure)
essential_cols = [col for col in crime_df.columns if 'state' in col or 'crime' in col or 'cases' in col or 'year' in col]
crime_df = crime_df[essential_cols]

# Drop missing rows
crime_df = crime_df.dropna()

# ---------- Step 6: Save final CSV ----------
crime_data_path = os.path.join(download_path, "crime_data.csv")
crime_df.to_csv(crime_data_path, index=False)
print(f"Cleaned crime_data.csv saved at {crime_data_path}")
