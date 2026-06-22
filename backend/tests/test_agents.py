import pandas as pd
import pytest

from agents.tools.data_quality_tool import analyze_data_quality
from agents.tools.eda_tool import run_eda
from agents.tools.visualization_tool import generate_visualizations
from agents.tools.report_tool import generate_report


@pytest.fixture
def sample_df():
    return pd.DataFrame({
        "id": [1, 2, 3, 4, 5],
        "name": ["Alice", "Bob", "Charlie", None, "Eve"],
        "age": [30, 25, 35, 28, None],
        "salary": [70000, 55000, 90000, 60000, 65000],
        "department": ["Eng", "Sales", "Eng", "HR", "Sales"],
    })


@pytest.fixture
def empty_df():
    return pd.DataFrame()


class TestDataQualityTool:
    def test_basic_analysis(self, sample_df):
        result = analyze_data_quality(sample_df)

        assert result.total_records == 5
        assert result.total_rows == 5
        assert result.total_columns == 5
        assert result.missing_values == 2
        assert result.duplicate_rows == 0

    def test_column_types(self, sample_df):
        result = analyze_data_quality(sample_df)

        assert "id" in result.column_types
        assert "name" in result.column_types

    def test_empty_dataframe(self, empty_df):
        result = analyze_data_quality(empty_df)

        assert result.total_records == 0
        assert result.total_rows == 0
        assert result.total_columns == 0
        assert result.missing_values == 0
        assert result.duplicate_rows == 0

    def test_duplicates_detected(self):
        df = pd.DataFrame({"a": [1, 1, 2], "b": ["x", "x", "y"]})
        result = analyze_data_quality(df)

        assert result.duplicate_rows == 1


class TestEDATool:
    def test_numeric_columns_identified(self, sample_df):
        result = run_eda(sample_df)

        assert "id" in result.numeric_columns
        assert "age" in result.numeric_columns
        assert "salary" in result.numeric_columns
        assert "name" not in result.numeric_columns

    def test_categorical_columns_identified(self, sample_df):
        result = run_eda(sample_df)

        assert "department" in result.categorical_columns

    def test_summary_statistics(self, sample_df):
        result = run_eda(sample_df)

        assert "salary" in result.summary_statistics
        stats = result.summary_statistics["salary"]
        assert "mean" in stats
        assert "std" in stats
        assert stats["mean"] == 68000.0

    def test_value_counts(self, sample_df):
        result = run_eda(sample_df)

        assert "department" in result.value_counts
        assert result.value_counts["department"]["Eng"] == 2
        assert result.value_counts["department"]["Sales"] == 2

    def test_correlation_matrix(self, sample_df):
        result = run_eda(sample_df)

        assert "salary" in result.correlation_matrix
        assert result.correlation_matrix["salary"]["salary"] == 1.0

    def test_empty_dataframe(self, empty_df):
        result = run_eda(empty_df)

        assert result.numeric_columns == []
        assert result.categorical_columns == []


class TestVisualizationTool:
    def test_generates_histograms(self, sample_df, tmp_path):
        charts = generate_visualizations(sample_df, output_dir=tmp_path)

        assert len(charts) == 3
        for chart_path in charts:
            assert chart_path.endswith("_histogram.png")
            assert (tmp_path / chart_path.split("/")[-1]).exists()

    def test_empty_dataframe(self, empty_df, tmp_path):
        charts = generate_visualizations(empty_df, output_dir=tmp_path)

        assert charts == []


class TestReportTool:
    def test_generates_report(self, sample_df):
        quality_result = analyze_data_quality(sample_df)
        eda_result = run_eda(sample_df)
        insights = ["High correlation between age and salary"]
        charts = ["/path/to/chart.png"]

        report = generate_report(quality_result, eda_result, insights, charts)

        assert "DATA QUALITY REPORT" in report
        assert "EDA REPORT" in report
        assert "INSIGHTS" in report
        assert "VISUALIZATION REPORT" in report
        assert "High correlation between age and salary" in report
        assert "/path/to/chart.png" in report
