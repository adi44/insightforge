from pathlib import Path

from app.services.dataset_service import DatasetService
from agents.tools.data_quality_tool import analyze_data_quality
from agents.tools.eda_tool import run_eda
from agents.tools.visualization_tool import generate_visualizations
from agents.tools.report_tool import generate_report

BASE_DIR = Path(__file__).resolve().parent


def main():
    dataset_service = DatasetService()
    dataset = dataset_service.load_dataset(BASE_DIR / "data" / "sample_dataset.csv")

    if dataset.empty:
        print("Failed to load dataset.")
        return

    quality_result = analyze_data_quality(dataset)

    print("Data Quality Analysis:")
    print(f"Total Records: {quality_result.total_records}")
    print(f"Total Rows: {quality_result.total_rows}")
    print(f"Total Columns: {quality_result.total_columns}")
    print(f"Missing Values: {quality_result.missing_values}")
    print(f"Duplicate Rows: {quality_result.duplicate_rows}")
    print(f"Column Types: {quality_result.column_types}")

    eda_result = run_eda(dataset)

    print("\n=== EDA REPORT ===")
    print(f"Numeric Columns: {eda_result.numeric_columns}")

    print("\nSummary Statistics:")
    for column, values in eda_result.summary_statistics.items():
        print(f"\n{column}")
        print(f"  Mean: {values.get('mean')}")
        print(f"  Std: {values.get('std')}")

    print("\nCategorical Columns:")
    for column, counts in eda_result.value_counts.items():
        print(f"\n{column}")
        for value, count in counts.items():
            print(f"  {value}: {count}")

    print("\nCorrelation Matrix:")
    for col1, correlations in eda_result.correlation_matrix.items():
        print(f"\n{col1}")
        for col2, corr_value in correlations.items():
            print(f"  {col2}: {corr_value}")

    charts = generate_visualizations(dataset)

    print("\n=== VISUALIZATION REPORT ===")
    for chart in charts:
        print(chart)

    insights = ["Insight 1: ...", "Insight 2: ..."]
    report = generate_report(quality_result, eda_result, insights, charts)
    print("\n=== FINAL REPORT ===")
    print(report)


if __name__ == "__main__":
    main()