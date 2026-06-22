from pandas import DataFrame

from app.schemas.data_quality import DataQualityResult


def analyze_data_quality(dataframe: DataFrame) -> DataQualityResult:
    total_records = len(dataframe)
    total_rows, total_columns = dataframe.shape
    missing_values = int(dataframe.isnull().sum().sum())
    duplicate_rows = int(dataframe.duplicated().sum())
    column_types = {col: str(dtype) for col, dtype in dataframe.dtypes.items()}

    return DataQualityResult(
        total_records=total_records,
        total_rows=total_rows,
        total_columns=total_columns,
        missing_values=missing_values,
        duplicate_rows=duplicate_rows,
        column_types=column_types,
    )
