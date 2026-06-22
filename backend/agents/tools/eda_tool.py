from pandas import DataFrame

from app.schemas.eda import EDAResult


def run_eda(dataframe: DataFrame) -> EDAResult:
    numeric_columns = dataframe.select_dtypes(include="number").columns.tolist()
    categorical_columns = dataframe.select_dtypes(include=["object", "string"]).columns.tolist()

    summary_statistics = {col: dataframe[col].describe().to_dict() for col in numeric_columns}
    value_counts = {col: dataframe[col].value_counts().to_dict() for col in categorical_columns}
    correlation_matrix = dataframe[numeric_columns].corr().to_dict() if numeric_columns else {}

    return EDAResult(
        numeric_columns=numeric_columns,
        categorical_columns=categorical_columns,
        summary_statistics=summary_statistics,
        value_counts=value_counts,
        correlation_matrix=correlation_matrix,
    )
