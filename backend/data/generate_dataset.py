"""Generate a complex e-commerce sales dataset with 1000 records."""

import random
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

REGIONS = ["North", "South", "East", "West"]
SEGMENTS = ["Consumer", "Corporate", "Home Office"]
CATEGORIES = {
    "Electronics":   ["Laptop", "Smartphone", "Tablet", "Monitor", "Headphones", "Keyboard", "Webcam"],
    "Furniture":     ["Chair", "Desk", "Bookshelf", "Cabinet", "Sofa", "Lamp", "Table"],
    "Clothing":      ["T-Shirt", "Jeans", "Jacket", "Shoes", "Dress", "Sweater", "Shorts"],
    "Food & Beverage": ["Coffee", "Tea", "Protein Bar", "Juice", "Snack Box", "Olive Oil", "Pasta"],
    "Office Supplies": ["Notebook", "Pen Set", "Stapler", "Paper Ream", "Folder", "Marker Set", "Tape"],
}
SHIP_MODES = ["Standard", "Second Class", "First Class", "Same Day"]
CITIES = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
          "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
          "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte"]
PAYMENT_METHODS = ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Gift Card"]

base_prices = {
    "Laptop": 999, "Smartphone": 699, "Tablet": 449, "Monitor": 329,
    "Headphones": 149, "Keyboard": 79, "Webcam": 89,
    "Chair": 249, "Desk": 399, "Bookshelf": 179, "Cabinet": 299,
    "Sofa": 799, "Lamp": 59, "Table": 349,
    "T-Shirt": 29, "Jeans": 59, "Jacket": 99, "Shoes": 89,
    "Dress": 79, "Sweater": 69, "Shorts": 39,
    "Coffee": 18, "Tea": 12, "Protein Bar": 35, "Juice": 8,
    "Snack Box": 25, "Olive Oil": 22, "Pasta": 6,
    "Notebook": 8, "Pen Set": 12, "Stapler": 18, "Paper Ream": 15,
    "Folder": 5, "Marker Set": 14, "Tape": 4,
}

records = []
start_date = datetime(2023, 1, 1)

for i in range(1, 1001):
    category = random.choice(list(CATEGORIES.keys()))
    product = random.choice(CATEGORIES[category])
    region = random.choice(REGIONS)
    segment = random.choice(SEGMENTS)
    quantity = random.randint(1, 10)
    base_price = base_prices[product]
    unit_price = round(base_price * np.random.uniform(0.85, 1.15), 2)
    discount = round(random.choice([0, 0, 0, 0.05, 0.1, 0.15, 0.2, 0.25]), 2)
    revenue = round(unit_price * quantity * (1 - discount), 2)
    cost_ratio = np.random.uniform(0.45, 0.75)
    profit = round(revenue * (1 - cost_ratio), 2)
    order_date = start_date + timedelta(days=random.randint(0, 364))
    ship_days = {"Standard": random.randint(5, 7), "Second Class": random.randint(3, 5),
                 "First Class": random.randint(1, 3), "Same Day": 0}
    ship_mode = random.choice(SHIP_MODES)
    ship_date = order_date + timedelta(days=ship_days[ship_mode])
    rating = round(np.random.normal(4.0, 0.8), 1)
    rating = max(1.0, min(5.0, rating))

    records.append({
        "order_id":        f"ORD-{i:04d}",
        "order_date":      order_date.strftime("%Y-%m-%d"),
        "ship_date":       ship_date.strftime("%Y-%m-%d"),
        "ship_mode":       ship_mode,
        "customer_id":     f"CUST-{random.randint(1, 400):04d}",
        "customer_name":   None,  # intentionally blank — filled selectively below
        "segment":         segment,
        "city":            random.choice(CITIES),
        "region":          region,
        "category":        category,
        "product":         product,
        "quantity":        quantity,
        "unit_price":      unit_price,
        "discount":        discount,
        "revenue":         revenue,
        "profit":          profit,
        "payment_method":  random.choice(PAYMENT_METHODS),
        "rating":          rating if random.random() > 0.08 else None,  # 8% missing
        "returned":        random.random() < 0.07,  # 7% return rate
    })

df = pd.DataFrame(records)

# fill customer_name for ~92% of rows (8% missing)
names = [
    "James Wilson", "Mary Johnson", "Robert Brown", "Patricia Davis", "Michael Miller",
    "Linda Garcia", "William Martinez", "Barbara Anderson", "David Taylor", "Susan Thomas",
    "Richard Jackson", "Jessica White", "Joseph Harris", "Sarah Martin", "Charles Thompson",
    "Karen Lee", "Christopher Walker", "Lisa Hall", "Daniel Allen", "Nancy Young",
]
name_map = {cid: random.choice(names) for cid in df["customer_id"].unique()}
df["customer_name"] = df["customer_id"].map(name_map)
mask = np.random.random(len(df)) < 0.08
df.loc[mask, "customer_name"] = None

df.to_csv("sales_data.csv", index=False)
print(f"Generated {len(df)} records → sales_data.csv")
print(df.dtypes)
print(df.head(3))
