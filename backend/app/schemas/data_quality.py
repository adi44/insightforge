from pydantic import BaseModel

class DataQualityResult(BaseModel):
    total_records: int
    total_rows: int
    total_columns: int
    missing_values: int
    duplicate_rows: int
    column_types: dict
    