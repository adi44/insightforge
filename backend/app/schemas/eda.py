from pydantic import BaseModel, Field

class EDAResult(BaseModel):
    numeric_columns: list[str] = Field(..., description="List of numeric columns in the dataset")
    categorical_columns: list[str] = Field(..., description="List of categorical columns in the dataset")
    summary_statistics: dict[str, dict[str, float]] = Field(..., description="Summary statistics for numeric columns")
    value_counts: dict[str, dict[str, int]] = Field(..., description="Value counts for categorical columns")
    correlation_matrix: dict[str, dict[str, float]] = Field(..., description="Correlation matrix for numeric columns")