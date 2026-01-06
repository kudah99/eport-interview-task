#!/bin/bash

# Example curl command to POST a warranty
# Replace <BASE_URL> with your server URL (e.g., http://localhost:8000 or https://server15.eport.ws)

curl -X POST "<BASE_URL>/api/v1/warranty" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_name": "Laptop Dell XPS 15",
    "category": "Computer",
    "date_purchased": "2024-01-15",
    "cost": "1299.99",
    "department": "IT Department",
    "status": "Active",
    "user_id": 1,
    "user_name": "John Doe",
    "warranty_period_months": 24,
    "warranty_expiry_date": "2026-01-15",
    "notes": "Extended warranty purchased"
  }'

# Example with minimal required fields only:
# curl -X POST "<BASE_URL>/api/v1/warranty" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "asset_name": "Monitor Samsung 27inch",
#     "category": "Display",
#     "date_purchased": "2024-03-20",
#     "cost": "299.99",
#     "department": "Sales",
#     "user_id": 2,
#     "user_name": "Jane Smith"
#   }'

