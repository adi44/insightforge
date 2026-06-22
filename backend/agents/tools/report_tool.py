from app.schemas.data_quality import DataQualityResult
from app.schemas.eda import EDAResult


def generate_report(
    quality_result: DataQualityResult,
    eda_result: EDAResult,
    insights: list[str],
    charts: list[str],
) -> str:
    report = "=== DATA QUALITY REPORT ===\n"
    report += f"Total Records: {quality_result.total_records}\n"
    report += f"Total Rows: {quality_result.total_rows}\n"
    report += f"Total Columns: {quality_result.total_columns}\n"
    report += f"Missing Values: {quality_result.missing_values}\n"
    report += f"Duplicate Rows: {quality_result.duplicate_rows}\n"
    report += f"Column Types: {quality_result.column_types}\n\n"

    report += "=== EDA REPORT ===\n"
    report += f"Numeric Columns: {eda_result.numeric_columns}\n\n"

    report += "Summary Statistics:\n"
    for column, values in eda_result.summary_statistics.items():
        report += f"\n{column}\n"
        report += f"  Mean: {values.get('mean')}\n"
        report += f"  Std: {values.get('std')}\n"

    report += "\nCategorical Columns:\n"
    for column, counts in eda_result.value_counts.items():
        report += f"\n{column}\n"
        for value, count in counts.items():
            report += f"  {value}: {count}\n"

    report += "\nCorrelation Matrix:\n"
    for col1, correlations in eda_result.correlation_matrix.items():
        report += f"\n{col1}\n"
        for col2, corr_value in correlations.items():
            report += f"  {col2}: {corr_value}\n"

    report += "\n=== INSIGHTS ===\n"
    for insight in insights:
        report += f"- {insight}\n"

    report += "\n=== VISUALIZATION REPORT ===\n"
    for chart in charts:
        report += f"{chart}\n"

    return report
