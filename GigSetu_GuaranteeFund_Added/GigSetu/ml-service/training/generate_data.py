import pandas as pd
import numpy as np
import os

"""
GigSetu ML Training Data Generator
===================================
IMPORTANT: This generates SYNTHETIC/DEMO training data for prototype purposes only.
This data does NOT represent real-world booking patterns.
For production, replace with actual historical booking data.
"""

def generate_data(num_samples=1000):
    np.random.seed(42)
    
    # Generate features
    skill_match = np.random.uniform(0, 1, num_samples)
    distance_score = np.random.uniform(0, 1, num_samples)
    availability = np.random.choice([0.0, 0.5, 1.0], num_samples)
    workload_balance = np.random.uniform(0, 1, num_samples)
    rating = np.random.uniform(0, 1, num_samples)
    
    # Calculate weighted score for labels
    weighted_score = (0.30 * skill_match + 
                      0.20 * distance_score + 
                      0.15 * availability + 
                      0.25 * workload_balance + 
                      0.10 * rating)
    
    # Base label
    good_match = (weighted_score > 0.55).astype(int)
    
    # Add noise: randomly flip ~10% of labels
    flip_indices = np.random.choice(num_samples, size=int(0.1 * num_samples), replace=False)
    good_match[flip_indices] = 1 - good_match[flip_indices]
    
    # Create DataFrame
    df = pd.DataFrame({
        'skill_match': skill_match,
        'distance_score': distance_score,
        'availability': availability,
        'workload_balance': workload_balance,
        'rating': rating,
        'good_match': good_match
    })
    
    # Create output directory
    output_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, 'training_data.csv')
    df.to_csv(output_file, index=False)
    
    print("=" * 40)
    print("GigSetu ML Training Data Generator")
    print("=" * 40)
    print(f"Total samples: {num_samples}")
    print(f"Positive samples (1): {df['good_match'].sum()} ({df['good_match'].mean():.1%})")
    print(f"Negative samples (0): {num_samples - df['good_match'].sum()} ({(1 - df['good_match'].mean()):.1%})")
    print("\nFeature Statistics:")
    print(df.describe().round(3))
    print(f"\nSaved synthetic data to: {output_file}")

if __name__ == "__main__":
    generate_data()
